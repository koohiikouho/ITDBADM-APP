import { Elysia, t } from "elysia";
import { dbPool } from "../db";
import mysql from "mysql2/promise";
import { jwt } from "@elysiajs/jwt";
import { Money, Currencies } from "ts-money";

import { FrankfurterService } from "../services/frankfurterService";

export const productsController = new Elysia({ prefix: "/products" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
      exp: "1d",
    })
  )

  // GET /products
  .get("/all/:currency", async ({ params, set }) => {
    try {
      const query = `SELECT b.branch_id, p.product_id, b.name as 'band_name',p.name,p.description,p.category,p.price,p.image FROM products p LEFT JOIN bands b ON p.band_id=b.band_id WHERE p.is_deleted = 0;`;
      const currency = params.currency;

      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

      if (rows.length === 0) {
        set.status = 200;
        return { message: "No products registered yet." };
      }

      // Convert all products with the same currency
      const productList = Promise.all(
        rows.map(async (row) => {
          let singleImageUrl;

          if (row.image && row.image.url) {
            if (Array.isArray(row.image.url)) {
              singleImageUrl = row.image.url[0];
            } else {
              singleImageUrl = row.image.url;
            }
          } else {
            singleImageUrl = null;
          }

          // Use Frankfurter service for conversion - only get the converted amount
          const converted = FrankfurterService.convert(row.price, currency);

          return {
            branch: row.branch_id,
            id: row.product_id,
            band_name: row.band_name,
            name: row.name,
            description: row.description,
            category: row.category,
            price: converted.amount, // Use the converted amount directly (same field name)
            img: {
              url: [singleImageUrl], // Maintain nesting with single item array
            },
          };
        })
      );

      set.status = 200;
      return productList;
    } catch (error) {
      console.error("Error fetching all products:", error);
      set.status = 500;
      return {
        message: "Internal Server Error while retrieving product list.",
      };
    }
  })

  // DELETE /products/:id
  .delete("/:id", async ({ params, headers, set, jwt }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const userId = payload.id;
    const productId = params.id;

    try {
      // Verify user owns this product
      const [authRows] = await dbPool.execute<mysql.RowDataPacket[]>(
        `SELECT p.product_id 
         FROM products p 
         JOIN bands b ON p.band_id = b.band_id 
         WHERE p.product_id = ? AND b.manager_id = ?`,
        [productId, userId]
      );

      if (authRows.length === 0) {
        set.status = 403;
        return { error: "You are not authorized to delete this product" };
      }

      // Soft delete the product
      const deleteQuery =
        "UPDATE products SET is_deleted = 1 WHERE product_id = ?";
      const [result] = await dbPool.execute<mysql.OkPacket>(deleteQuery, [
        productId,
      ]);

      if (result.affectedRows === 0) {
        set.status = 404;
        return { error: "Product not found" };
      }

      return { message: "Product deleted successfully" };
    } catch (error) {
      console.error("Error deleting product:", error);
      set.status = 500;
      return { error: "Internal Server Error while deleting product" };
    }
  })

  // GET /products/:id
  .get(
    "/:id/:currency",
    async ({ params, set, query }) => {
      try {
        const productId = params.id;
        const currency = params.currency;

        // SQL Query: Fetch detailed info for a specific product by ID
        const query = `SELECT band_id, name, price, description, category, image FROM products WHERE product_id = ${productId} AND is_deleted = 0;`;

        const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

        if (rows.length === 0) {
          set.status = 404;
          return { message: "Product not found." };
        }

        const product = rows[0];

        // Convert price if currency is specified and not JPY
        if (currency && currency !== "JPY") {
          const converted = await FrankfurterService.convert(
            product.price,
            currency
          );
          product.price = converted.amount;
        }

        set.status = 200;
        return product;
      } catch (error) {
        console.error("Error fetching product by ID:", error);
        set.status = 500;
        return { message: "Internal Server Error while retrieving product." };
      }
    },
    {
      query: t.Object({
        currency: t.Optional(t.String()),
      }),
    }
  );
