import { Elysia, t } from "elysia";
import { dbPool } from "../db";
import mysql from "mysql2/promise";
import { jwt } from "@elysiajs/jwt";

export const ordersController = new Elysia({ prefix: "/orders" })

  // GET /orders
  .get("/", async ({ set }) => {
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

  .get("/user", async ({ headers, set, jwt }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const userId = payload.id;

    try {
      const query = `SELECT * FROM orders WHERE user_id = ${userId};`;

      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

      if (rows.length === 0) {
        set.status = 200;
        return { message: "Orders not found" };
      }

      const userOrdersList = rows.map((row) => ({
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
      return userOrdersList;
    } catch (error) {
      console.error("Error fetching user orders: ", error);
      set.status = 500;
      return { message: "Internal Server Error while retrieving user orders." };
    }
  });
