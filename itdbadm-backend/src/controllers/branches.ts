import { Elysia, t } from "elysia";
import { dbPool } from "../db";
import mysql from "mysql2/promise";

export const branchController = new Elysia({ prefix: "/branch" }).get(
  "/",
  async ({ set }) => {
    try {
      const query = `SELECT branch_id, branch_name FROM branches`;

      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

      if (rows.length === 0) {
        set.status = 200;
        return { message: "No branches found." };
      }

      const branchesList = rows; // Direct result set

      return branchesList; // Return the branches array
    } catch (error) {
      console.error("Error fetching branches:", error);
      set.status = 500;
      return {
        message: "Internal Server Error while retrieving branches.",
      };
    }
  }
);
