import { Elysia, t } from "elysia";
import { dbPool } from "../db";
import mysql from 'mysql2/promise';


export const cartsController = new Elysia({ prefix: '/carts' })

//GET all products from a user's cart

    .get("/user", async ({ headers, set, jwt }) => {

        const token = headers.authorization?.split(" ")[1];
        const payload = await jwt.verify(token);

        if(!payload) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const userId = payload.id;

        try {
            const query = `SELECT * FROM carts WHERE user_id = ${userId};`;

            const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

            if (rows.length === 0) {
                set.status = 200;
                return { message: "No items in the cart found." };
            }

            const userCartList = rows.map((row) => ({
                user_id: row.user_id,
                product_id: row.product_id,
                quantity: row.quantity
            }));

            set.status = 200;
            return userCartList;
            

        } catch (error) {
            console.error("Error fetching cart contents: ", error);
            set.status = 500;
            return { message: "Internal Server Error while retrieving user cart."};
        }
    })
