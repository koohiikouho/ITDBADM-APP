import { Elysia, t } from "elysia";
import bcrypt from "bcrypt";
import { dbPool } from "./db";
import { jwt } from "@elysiajs/jwt";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
      exp: "1d",
    })
  )

  .post(
    "/signup",
    async ({ body, jwt, set }) => {
      // check if user already exists
      const { userName, email, password, currency, userType } = body;

      const [rows] = await dbPool.query(
        "SELECT user_id FROM users WHERE username = ?",
        [userName]
      );
      if ((rows as any[]).length > 0) {
        set.status = 409;
        return { message: "Username already exists" };
      }

      const hashed = await bcrypt.hash(password, 10);
      const [result] = await dbPool.query(
        "INSERT INTO users (username, email, password_hashed, currency_id, role_id) VALUES (?, ?, ?, ?, ?)",
        [userName, email, hashed, currency, userType]
      );

      const userId = (result as any).insertId;

      const token = await jwt.sign({ id: userId });

      return { message: "User registered successfully", token };
    },
    {
      body: t.Object({
        userName: t.String(),
        email: t.String(),
        password: t.String(),
        currency: t
          .Transform(t.Union([t.Number(), t.String()]))
          .Decode((value) => Number(value))
          .Encode((value) => value),
        userType: t
          .Transform(t.Union([t.Number(), t.String()]))
          .Decode((value) => Number(value))
          .Encode((value) => value),
      }),
    }
  );
