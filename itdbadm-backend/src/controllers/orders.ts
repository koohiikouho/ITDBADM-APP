import { Elysia, t } from "elysia";
import { dbPool } from "../db";
import mysql from "mysql2/promise";
import { jwt } from "@elysiajs/jwt";
import { FrankfurterService } from "../services/frankfurterService";

export const ordersController = new Elysia({ prefix: "/orders" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
      exp: "1d",
    })
  )

  // GET /orders
  .get("/", async ({ params, set }) => {
    try {
      const query = `SELECT * FROM orders`;

      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

      if (rows.length === 0) {
        set.status = 200;
        return { message: "No orders at the moment." };
      }

      const orderList = rows.map((row) => ({
        id: row.order_id,
        user_id: row.user_id,
        order_date: row.order_date,
        status: row.status,
        date_fulfilled: row.date_fulfilled,
        price: row.price,
        offer_id: row.offer_id,
        description: row.description,
      }));

      set.status = 200;
      return orderList;
    } catch (error) {
      console.error("Error fetching all orders:", error);
      set.status = 500;
      return { message: "Internal Server Error while retrieving order list." };
    }
  })

  // GET /orders/:id

  .get("/user/:currency", async ({ params, headers, set, jwt }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const userId = payload.id;

    try {
      // First, get all orders for the user
      const ordersQuery = `SELECT * FROM orders WHERE user_id = ${userId}`;
      const [ordersRows] = await dbPool.execute<mysql.RowDataPacket[]>(
        ordersQuery
      );

      if (ordersRows.length === 0) {
        set.status = 200;
        return { message: "Orders not found" };
      }

      // For each order, get the associated products
      const userOrdersWithProducts = await Promise.all(
        ordersRows.map(async (order) => {
          const productsQuery = `
            SELECT 
              op.order_id,
              op.product_id,
              op.quantity,
              p.band_id,
              p.name,
              p.price,
              p.description,
              p.category,
              p.image,
              p.is_deleted,
              b.name as band_name
            FROM orders_products op 
            JOIN products p ON op.product_id = p.product_id
            JOIN bands b ON b.band_id = p.band_id
            WHERE op.order_id = ?
          `;

          const [productRows] = await dbPool.execute<mysql.RowDataPacket[]>(
            productsQuery,
            [order.order_id]
          );

          const products = productRows.map((product) => {
            // Handle different image formats to return only one image in array
            let singleImageUrl;

            if (product.image && product.image.url) {
              if (Array.isArray(product.image.url)) {
                // If it's an array, take the first image
                singleImageUrl = product.image.url[0];
              } else {
                // If it's already a single string, use it directly
                singleImageUrl = product.image.url;
              }
            } else {
              // Fallback if no image is available
              singleImageUrl = null;
            }

            return {
              product_id: product.product_id,
              quantity: product.quantity,
              band_id: product.band_id,
              name: product.name,
              price: FrankfurterService.convert(product.price, params.currency)
                .amount,
              description: product.description,
              category: product.category,
              image: {
                url: singleImageUrl ? [singleImageUrl] : [],
              },
              is_deleted: product.is_deleted,
              band: product.band_name,
            };
          });

          return {
            id: order.order_id,
            user_id: order.user_id,
            order_date: order.order_date,
            status: order.status,
            date_fulfilled: order.date_fulfilled,
            price: FrankfurterService.convert(order.price, params.currency)
              .amount,
            offer_id: order.offer_id,
            description: order.description,
            products: products, // Include all products for this order
          };
        })
      );

      set.status = 200;
      return userOrdersWithProducts;
    } catch (error) {
      console.error("Error fetching user orders: ", error);
      set.status = 500;
      return { message: "Internal Server Error while retrieving user orders." };
    }
  });
