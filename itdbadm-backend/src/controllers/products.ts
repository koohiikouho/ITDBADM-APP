import { Elysia, t } from "elysia";
import { dbPool } from "../db";
import mysql from "mysql2/promise";
import { jwt } from "@elysiajs/jwt";

export const productsController = new Elysia({ prefix: "/products" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
      exp: "1d",
    })
  )

  // GET /products
  .get("/", async ({ set }) => {
    try {
      const query = `SELECT b.branch_id, p.product_id, b.name as 'band_name',p.name,p.description,p.category,p.price,p.image FROM products p LEFT JOIN bands b ON p.band_id=b.band_id WHERE p.is_deleted = 0;`;

      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

      if (rows.length === 0) {
        set.status = 200;
        return { message: "No products registered yet." };
      }

      // Map the results to a clean array of product objects
      const productList = rows.map((row) => {
        // Handle different image formats to return only one image in array
        let singleImageUrl;

        if (row.image && row.image.url) {
          if (Array.isArray(row.image.url)) {
            // If it's an array, take the first image
            singleImageUrl = row.image.url[0];
          } else {
            // If it's already a single string, use it directly
            singleImageUrl = row.image.url;
          }
        } else {
          // Fallback if no image is available
          singleImageUrl = null;
        }

        return {
          branch: row.branch_id,
          id: row.product_id,
          band_name: row.band_name,
          name: row.name,
          description: row.description,
          category: row.category,
          price: row.price,
          img: {
            url: [singleImageUrl], // Maintain nesting with single item array
          },
        };
      });

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
      const deleteQuery = "UPDATE products SET is_deleted = 1 WHERE product_id = ?";
      const [result] = await dbPool.execute<mysql.OkPacket>(deleteQuery, [productId]);

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
  .get("/:id", async ({ params, set }) => {
    try {
      const productId = params.id;

      // SQL Query: Fetch detailed info for a specific product by ID
      const query = `SELECT band_id, name, price, description, category, image FROM products WHERE product_id = ${productId} AND is_deleted = 0;`;

      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

      if (rows.length === 0) {
        set.status = 404;
        return { message: "Product not found." };
      }

      const product = rows[0];
      set.status = 200;

      return product;
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      set.status = 500;
      return { message: "Internal Server Error while retrieving product." };
    }
  });