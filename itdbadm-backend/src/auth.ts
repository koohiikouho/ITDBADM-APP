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
      const { userName, email, password, currency, userType, branchId } = body;

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

      // If the user is a Band Manager (role_id = 4) and a branch was selected
      // Update the automatically created band (created by the DB trigger) with the selected branch
      if (userType === 4 && branchId) {
        try {
          // The trigger creates the band immediately after user insertion
          // So we can update it right away
          await dbPool.query(
            "UPDATE bands SET branch_id = ? WHERE manager_id = ?",
            [branchId, userId]
          );
        } catch (error) {
          console.error("Error updating band branch:", error);
          // We don't fail the whole request, but we log the error.
          // The band still exists with the default branch from the trigger (-1).
        }
      }

      const token = await jwt.sign({ id: userId, role_id: userType });

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
        // Optional branchId for Band Managers
        branchId: t.Optional(
          t.Transform(t.Union([t.Number(), t.String()]))
          .Decode((value) => Number(value))
          .Encode((value) => value)
        ),
      }),
    }
  )

  .post(
    "/signin",
    async ({ body, jwt, set }) => {
      const { username, password } = body;

      const [rows] = await dbPool.query(
        "SELECT user_id, password_hashed, role_id FROM users WHERE username = ? AND is_deleted = 0",
        [username]
      );

      const user = (rows as any[])[0];
      if (!user) {
        set.status = 400;
        return { error: "Invalid username or password" };
      }

      // TEMPORARY please FOR THE "hashed_pw" placeholder
      if (user.password_hashed === "hashed_pw") {
        // accept "hashed_pw" as the actual password
        if (password === "hashed_pw") {
          const token = await jwt.sign({ id: user.user_id, role_id: user.role_id });
          return { message: "Signed in successfully", accessToken: token };
        } else {
          set.status = 400;
          return { error: "Invalid username or password" };
        }
      }

      // this is the normal bcrypt comparison for properly hashed passwords
      const valid = await bcrypt.compare(password, user.password_hashed);
      if (!valid) {
        set.status = 400;
        return { error: "Invalid username or password" };
      }

      // FIX: Use user_id instead of id
      const token = await jwt.sign({ id: user.user_id, role_id: user.role_id });
      return { message: "Signed in successfully", accessToken: token };
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    }
  )

  .post("/signout", () => ({
    message: "Signed out successfully",
  }));