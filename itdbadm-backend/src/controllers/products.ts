import { Elysia, t } from "elysia";
import { dbPool } from "../db"; 
import mysql from "mysql2/promise";

export const productsController = new Elysia({ prefix: "/products" })

// GET /products
    .get("/", async ({ set }) => {
      try {
        // SQL Query: Fetch essential details for all non-deleted products
        const query = `SELECT * FROM products WHERE is_deleted = 0;`;

        const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

        if (rows.length === 0) {
            set.status = 200;
            return { message: "No products registered yet." };
        }

        // Map the results to a clean array of product objects
        const productList = rows.map((row) => ({
            id: row.product_id,
            band_id: row.band_id,
            name: row.name,
            description: row.description,
            category: row.category,
            price: row.price,
            img: row.image,
        }));

        set.status = 200;
        return productList;

      } catch (error) {
        console.error("Error fetching all products:", error);
        set.status = 500;
        return { message: "Internal Server Error while retrieving product list." };
      }

    });