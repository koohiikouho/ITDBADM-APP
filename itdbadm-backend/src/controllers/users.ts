import { Elysia, t } from "elysia";
import { dbPool } from "../db"; // Import our database pool
import mysql from "mysql2/promise";
import { jwt } from "@elysiajs/jwt";

import bcrypt from "bcrypt";

export const usersController = new Elysia({ prefix: "/users" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
      exp: "1d",
    })
  )

  .get("/currency", async ({ jwt, set, request }) => {
    try {
      // Get the token from Authorization header
      const authHeader = request.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return { currency: "JPY" };
      }

      const token = authHeader.substring(7);

      // Verify JWT token and extract user ID from it
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        return { currency: "JPY" };
      }

      // Get user ID from JWT payload
      const user_id = payload.userId || payload.sub || payload.id;

      if (!user_id) {
        set.status = 400;
        return { currency: "JPY" };
      }

      // Query the database using user_id from token
      const query = `SELECT c.currency_code FROM users u JOIN currencies c ON u.currency_id=c.currency_id WHERE user_id = ?`;
      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query, [
        user_id,
      ]);

      if (!rows || rows.length === 0) {
        set.status = 404;
        return { error: "User not found." };
      }

      const currency_code = rows[0]?.currency_code;

      // Return username
      return { currency: currency_code };
    } catch (error) {
      console.error("No user logged in", error);

      if (error instanceof Error) {
        if (error.message.includes("jwt") || error.message.includes("token")) {
          set.status = 401;
          return { currency: "JPY" };
        }
      }

      set.status = 500;
      return { currency: "JPY" };
    }
  })
  // GET /users/username/
  .get("/username", async ({ jwt, set, request }) => {
    try {
      // Get the token from Authorization header
      const authHeader = request.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Authentication token required." };
      }

      const token = authHeader.substring(7);

      // Verify JWT token and extract user ID from it
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        return { error: "Invalid or expired token." };
      }

      // Get user ID from JWT payload
      const user_id = payload.userId || payload.sub || payload.id;

      if (!user_id) {
        set.status = 400;
        return { error: "User ID not found in token." };
      }

      // Query the database using user_id from token
      const query = `SELECT username FROM users WHERE user_id = ?`;
      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query, [
        user_id,
      ]);

      if (!rows || rows.length === 0) {
        set.status = 404;
        return { error: "User not found." };
      }

      const username = rows[0]?.username;

      // Return username
      return { username: username };
    } catch (error) {
      console.error("Error fetching username", error);

      // Handle JWT verification errors
      if (error instanceof Error) {
        if (error.message.includes("jwt") || error.message.includes("token")) {
          set.status = 401;
          return { error: "Invalid authentication token." };
        }
      }

      set.status = 500;
      return { error: "Internal Server Error while retrieving username." };
    }
  })

  // GET /users/profile - all user details
  .get("/profile", async ({ headers, set, jwt }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const userId = payload.id;

    try {
      const query = `
        SELECT u.username, u.email, u.currency_id, c.currency_code 
        FROM users u
        LEFT JOIN currencies c ON u.currency_id = c.currency_id
        WHERE u.user_id = ? AND u.is_deleted = 0
      `;
      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query, [
        userId,
      ]);

      if (rows.length === 0) {
        set.status = 404;
        return { error: "User not found" };
      }

      const user = rows[0];
      return {
        username: user?.username,
        email: user?.email,
        currency_id: user?.currency_id,
        currency_code: user?.currency_code,
      };
    } catch (error) {
      console.error("Error fetching profile: ", error);
      set.status = 500;
      return { error: "Internal Server Error " };
    }
  })

  // PUT /users/profile - Update profile details
  .put(
    "/profile",
    async ({ headers, body, set, jwt }) => {
      const token = headers.authorization?.split(" ")[1];
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const userId = payload.id;
      const { username, email, password, currency_id } = body;

      const connection = await dbPool.getConnection();
      await connection.beginTransaction();

      try {
        // 1. Validate Username Uniqueness
        if (username) {
          const [existingUser] = await connection.execute<
            mysql.RowDataPacket[]
          >("SELECT user_id FROM users WHERE username = ? AND user_id != ?", [
            username,
            userId,
          ]);
          if (existingUser.length > 0) {
            set.status = 409;
            return { error: "Username already taken" };
          }
        }

        // 2. Validate Email Uniqueness (if changed)
        if (email) {
          const [existingEmail] = await connection.execute<
            mysql.RowDataPacket[]
          >("SELECT user_id FROM users WHERE email = ? AND user_id != ?", [
            email,
            userId,
          ]);
          if (existingEmail.length > 0) {
            set.status = 409;
            return { error: "Email already in use" };
          }
        }

        // 3. Build Update Query dynamically
        let updates: string[] = [];
        let values: any[] = [];

        if (username) {
          updates.push("username = ?");
          values.push(username);
        }
        if (email) {
          updates.push("email = ?");
          values.push(email);
        }
        if (currency_id) {
          updates.push("currency_id = ?");
          values.push(currency_id);
        }
        if (password) {
          if (password.length < 6) {
            set.status = 400;
            return { error: "Password must be at least 6 characters long" };
          }
          const hashedPassword = await bcrypt.hash(password, 10);
          updates.push("password_hashed = ?");
          values.push(hashedPassword);
        }

        if (updates.length === 0) {
          connection.release();
          return { message: "No changes detected" };
        }

        const updateQuery = `UPDATE users SET ${updates.join(
          ", "
        )} WHERE user_id = ?`;
        values.push(userId);

        await connection.execute(updateQuery, values);
        await connection.commit();

        return { message: "Profile updated successfully" };
      } catch (error) {
        await connection.rollback();
        console.error("Error updating profile:", error);
        set.status = 500;
        return { error: "Internal Server Error during profile update" };
      } finally {
        connection.release();
      }
    },
    {
      body: t.Object({
        username: t.Optional(t.String()),
        email: t.Optional(t.String()),
        password: t.Optional(t.String()),
        currency_id: t.Optional(t.Numeric()),
      }),
    }
  );
