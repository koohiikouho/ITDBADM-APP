import { Elysia, t } from "elysia";
import { dbPool } from "../db";
import mysql from "mysql2/promise";

export const productsController = new Elysia({ prefix: "/products" })

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
