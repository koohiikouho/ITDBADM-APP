import { Elysia, t } from 'elysia';
import { dbPool } from '../db'; // Import our database pool
import mysql from 'mysql2/promise';



export const usersController = new Elysia({ prefix: '/users' })


// GET /users/username/:id
.get ("/username/:id", async ({ params, body, set }) => {

        const user_id = params.id;

        if (isNaN(Number(user_id))) {
            set.status = 400;
            return { error: "Invalid user id." };
        }

        try {
            const query = `SELECT username FROM users WHERE user_id = ${user_id};`;

            const [row] = await dbPool.execute<mysql.RowDataPacket[]>(query);

            if (!row) {
                set.status = 200;
                return { message: "user not found." };
            }

            const username = row[0];

            return username;

        } catch (error) {
            console.error("Error fetching username", error);
            set.status = 500;
            return { message: "Internal Server Error while retrieving username." };
        }
    })


// POST /users/signup




    // POST /users/login
    


    // POST /users/register
    // .post('/register', async ({ body, set }) => {
    //     // 1. Validate the incoming role against defined IDs
    //     const roleId = (body.role === 'Artist') ? 4 : 3; // 4=BandManager, 3=Customer (based on your SQL schema)
    //     const defaultCurrencyId = 2; // USD (based on your SQL currencies table)

    //     // 2. Hash the password (using a proper library like argon2 or bcrypt is highly recommended in production)
    //     const password_hashed = `hashed_pw_for_${body.username}`; // Placeholder for now

    //     try {
    //         // 3. Insert the new user into the 'users' table
    //         const query = `
    //             INSERT INTO users (role_id, username, email, password_hashed, genre, currency_id)
    //             VALUES (?, ?, ?, ?, ?, ?);
    //         `;
    //         const [result] = await dbPool.execute<mysql.ResultSetHeader>(query, [
    //             roleId,
    //             body.username,
    //             body.email,
    //             password_hashed,
    //             body.genre || null, // Genre is only for artists
    //             defaultCurrencyId
    //         ]);

    //         // The MySQL trigger 'trg_auto_create_band' handles band table insertion for artists (role_id 4)

    //         set.status = 201; // Created
    //         return {
    //             message: "Account created successfully.",
    //             user_id: result.insertId,
    //             role: body.role
    //         };

    //     } catch (error) {
    //         console.error('Registration error:', error);
    //         // Check for duplicate key error (username/email unique constraint)
    //         if (error && (error as any).code === 'ER_DUP_ENTRY') {
    //             set.status = 409; // Conflict
    //             return { message: "Username or email already exists." };
    //         }
    //         set.status = 500;
    //         return { message: 'Internal Server Error during registration.' };
    //     }
    // }, {
    //     // Input validation using Elysia's schema system (t)
    //     body: t.Object({
    //         username: t.String({ minLength: 3 }),
    //         email: t.String({ format: 'email' }),
    //         password: t.String({ minLength: 6 }),
    //         role: t.Union([t.Literal('Customer'), t.Literal('Artist')]),
    //         genre: t.Optional(t.String())
    //     }),
    //     detail: {
    //         summary: 'Register a new user or artist account'
    //     }
    // })

    // Like or unlike a product
    // .post('product/:id/like', async ({ params, body, set }) => {
    //     const productId = params.id;
    //     const userId = body.user_id; // In real scenarios, get this from auth context)


    //     try {

    //     } catch (error) {
    //         console.error('Error liking/unliking product:', error); 
    //     }
    // });