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
  )

  .post (
    "/signin", async ({ body, jwt, set }) => {
        const { username, password } = body;

        const [rows] = await dbPool.query(
            "SELECT user_id, password_hashed FROM users WHERE username = ?",
            [username]
        );

        const user = (rows as any[])[0];
        if (!user) {
            set.status = 400;
            return { error: "invalid username or password" };
        }

         const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            set.status = 400;
            return { error: "Invalid username or password" };
        }

        const token = await jwt.sign({ id: user.id });
        return { message: "signed in successfully", token };
    },
    {
        body: t.Object({
            username: t.String(),
            password: t.String()
        }),
    }
  )

  .post ("/signout", () => ({
        message: "Signed out successfully",
  }));
