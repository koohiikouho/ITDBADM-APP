import { Elysia, t } from "elysia";
import { dbPool } from "../db";
import mysql from "mysql2/promise";

import { jwt } from "@elysiajs/jwt";;

export const likeController = new Elysia({ prefix: "/like" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
      exp: "1d",
    })
  )

  // GET /like/:productId - Check if product is liked by user
  .get("/:productId", async ({ params: { productId }, headers, set, jwt }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const userId = payload.id;
    const productIdNum = parseInt(productId);

    try {
      const query = `SELECT * FROM user_likes WHERE user_id = ? AND product_id = ?`;
      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query, [
        userId,
        productIdNum,
      ]);

      return {
        productId: productIdNum,
        isLiked: rows.length > 0,
        message:
          rows.length > 0 ? "Product is liked" : "Product is not liked yet",
      };
    } catch (error) {
      console.error("Error checking like status:", error);
      set.status = 500;
      return {
        message: "Internal Server Error while checking like status.",
      };
    }
  })

  // POST /like/:productId - Toggle like status (add or remove)
  .post("/:productId", async ({ params: { productId }, headers, set, jwt }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const userId = payload.id;
    const productIdNum = parseInt(productId);

    try {
      // Check if the like already exists
      const checkQuery = `SELECT * FROM user_likes WHERE user_id = ? AND product_id = ?`;
      const [existingRows] = await dbPool.execute<mysql.RowDataPacket[]>(
        checkQuery,
        [userId, productIdNum]
      );

      if (existingRows.length > 0) {
        // Unlike - remove the entry
        const deleteQuery = `DELETE FROM user_likes WHERE user_id = ? AND product_id = ?`;
        await dbPool.execute(deleteQuery, [userId, productIdNum]);

        return {
          productId: productIdNum,
          isLiked: false,
          action: "removed",
          message: "Product unliked successfully",
        };
      } else {
        // Like - add the entry
        const insertQuery = `INSERT INTO user_likes (user_id, product_id) VALUES (?, ?)`;
        await dbPool.execute(insertQuery, [userId, productIdNum]);

        set.status = 201;
        return {
          productId: productIdNum,
          isLiked: true,
          action: "added",
          message: "Product liked successfully",
        };
      }
    } catch (error) {
      console.error("Error toggling like status:", error);
      set.status = 500;
      return {
        message: "Internal Server Error while updating like status.",
      };
    }
  })

  // GET /like/my-likes - Get all liked product IDs for the user
  .get("/my-likes", async ({ headers, set, jwt }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const userId = payload.id;

    try {
      const query = `SELECT product_id FROM user_likes WHERE user_id = ?`;
      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query, [
        userId,
      ]);

      // Return just an array of product IDs as expected by the frontend
      const likedProductIds = rows.map((row) => row.product_id);

      return likedProductIds;
    } catch (error) {
      console.error("Error fetching user likes:", error);
      set.status = 500;
      return {
        message: "Internal Server Error while fetching user likes.",
      };
    }
  })

  // POST /like - Add a like (alternative endpoint for frontend compatibility)
  .post(
    "/",
    async ({ body, headers, set, jwt }) => {
      const token = headers.authorization?.split(" ")[1];
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const userId = payload.id;
      const { product_id } = body;

      try {
        // Check if the like already exists
        const checkQuery = `SELECT * FROM user_likes WHERE user_id = ? AND product_id = ?`;
        const [existingRows] = await dbPool.execute<mysql.RowDataPacket[]>(
          checkQuery,
          [userId, product_id]
        );

        if (existingRows.length > 0) {
          set.status = 400;
          return { error: "Product is already liked" };
        }

        // Add the like
        const insertQuery = `INSERT INTO user_likes (user_id, product_id) VALUES (?, ?)`;
        await dbPool.execute(insertQuery, [userId, product_id]);

        set.status = 201;
        return {
          productId: product_id,
          isLiked: true,
          action: "added",
          message: "Product liked successfully",
        };
      } catch (error) {
        console.error("Error adding like:", error);
        set.status = 500;
        return {
          message: "Internal Server Error while adding like.",
        };
      }
    },
    {
      body: t.Object({
        product_id: t.Numeric(),
      }),
    }
  )

  // DELETE /like - Remove a like (alternative endpoint for frontend compatibility)
  .delete(
    "/",
    async ({ body, headers, set, jwt }) => {
      const token = headers.authorization?.split(" ")[1];
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const userId = payload.id;
      const { product_id } = body;

      try {
        // Check if the like exists
        const checkQuery = `SELECT * FROM user_likes WHERE user_id = ? AND product_id = ?`;
        const [existingRows] = await dbPool.execute<mysql.RowDataPacket[]>(
          checkQuery,
          [userId, product_id]
        );

        if (existingRows.length === 0) {
          set.status = 404;
          return { error: "Like not found" };
        }

        // Remove the like
        const deleteQuery = `DELETE FROM user_likes WHERE user_id = ? AND product_id = ?`;
        await dbPool.execute(deleteQuery, [userId, product_id]);

        return {
          productId: product_id,
          isLiked: false,
          action: "removed",
          message: "Product unliked successfully",
        };
      } catch (error) {
        console.error("Error removing like:", error);
        set.status = 500;
        return {
          message: "Internal Server Error while removing like.",
        };
      }
    },
    {
      body: t.Object({
        product_id: t.Numeric(),
      }),
    }
  );
