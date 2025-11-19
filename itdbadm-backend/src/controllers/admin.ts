// controllers/admin.ts - FIXED VERSION
import { Elysia, t } from "elysia";
import { dbPool } from "../db";
import mysql from "mysql2/promise";
import { jwt } from "@elysiajs/jwt";

// Helper function to check admin access
async function checkAdminAccess(token: string | undefined, jwt: any): Promise<boolean> {
    if (!token) return false;

    try {
        const payload = await jwt.verify(token);
        if (!payload) return false;

        const [userRows] = await dbPool.execute<mysql.RowDataPacket[]>(
            "SELECT role_id FROM users WHERE user_id = ? AND is_deleted = 0",
            [payload.id]
        );

        return userRows.length > 0 && userRows[0]?.role_id === 1;
    } catch (error) {
        return false;
    }
}

export const adminController = new Elysia({ prefix: "/admin" })
    .use(
        jwt({
            name: "jwt",
            secret: process.env.JWT_SECRET as string,
            exp: "1d",
        })
    )

    // GET /admin/stats - System-wide analytics
    .get("/stats", async ({ headers, set, jwt }) => {
        const token = headers.authorization?.split(" ")[1];
        const isAdmin = await checkAdminAccess(token, jwt);

        if (!isAdmin) {
            set.status = 403;
            return { error: "Admin access required" };
        }

        try {
            // Total users by role
            const [userStats] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
          r.role_type,
          COUNT(u.user_id) as count
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.is_deleted = 0
        GROUP BY r.role_type
      `);

            // Total bands and products
            const [bandStats] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
          COUNT(*) as total_bands,
          SUM(CASE WHEN is_deleted = 1 THEN 1 ELSE 0 END) as deleted_bands
        FROM bands
      `);

            const [productStats] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
          COUNT(*) as total_products,
          SUM(CASE WHEN is_deleted = 1 THEN 1 ELSE 0 END) as deleted_products,
          SUM(CASE WHEN category LIKE '%Digital%' THEN 1 ELSE 0 END) as digital_products,
          SUM(CASE WHEN category LIKE '%Physical%' THEN 1 ELSE 0 END) as physical_products
        FROM products
      `);

            // Revenue stats
            const [revenueStats] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(price), 0) as total_revenue,
          AVG(price) as avg_order_value
        FROM orders 
        WHERE status != 'Cancelled'
      `);

            // Recent activity
            const [recentOrders] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT COUNT(*) as recent_orders
        FROM orders 
        WHERE order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);

            const [recentUsers] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT COUNT(*) as recent_users
        FROM users 
        WHERE user_id IN (SELECT user_id FROM orders WHERE order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY))
      `);

            return {
                user_stats: userStats,
                band_stats: bandStats[0],
                product_stats: productStats[0],
                revenue_stats: revenueStats[0],
                recent_activity: {
                    recent_orders: recentOrders[0]?.recent_orders || 0,
                    recent_users: recentUsers[0]?.recent_users || 0,
                }
            };

        } catch (error) {
            console.error("Error fetching admin stats:", error);
            set.status = 500;
            return { error: "Internal Server Error" };
        }
    })

    // GET /admin/users - Get all users with pagination
    .get("/users", async ({ headers, set, jwt, query }) => {
        const token = headers.authorization?.split(" ")[1];
        const isAdmin = await checkAdminAccess(token, jwt);

        if (!isAdmin) {
            set.status = 403;
            return { error: "Admin access required" };
        }

        // FIXED: Use String() to handle undefined values
        const page = Math.max(1, parseInt(String(query.page)) || 1);
        const limit = Math.max(1, parseInt(String(query.limit)) || 10);
        const offset = (page - 1) * limit;

        try {
            const [users] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
          u.user_id,
          u.username,
          u.email,
          r.role_type,
          u.currency_id,
          u.is_deleted,
          COUNT(DISTINCT o.order_id) as order_count,
          COUNT(DISTINCT bo.offer_id) as booking_count
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN orders o ON u.user_id = o.user_id
        LEFT JOIN booking_offers bo ON u.user_id = bo.user_id
        GROUP BY u.user_id
        ORDER BY u.user_id DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

            const [total] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT COUNT(*) as total FROM users WHERE is_deleted = 0
      `);

            return {
                users,
                pagination: {
                    page,
                    limit,
                    total: total[0]?.total || 0,
                    total_pages: Math.ceil((total[0]?.total || 0) / limit)
                }
            };

        } catch (error) {
            console.error("Error fetching users:", error);
            set.status = 500;
            return { error: "Internal Server Error" };
        }
    })

    // PUT /admin/users/:id - Update user
    .put("/users/:id", async ({ headers, set, jwt, params, body }) => {
        const token = headers.authorization?.split(" ")[1];
        const isAdmin = await checkAdminAccess(token, jwt);

        if (!isAdmin) {
            set.status = 403;
            return { error: "Admin access required" };
        }

        const userId = params.id;
        const { username, email, role_id, currency_id } = body;

        try {
            // Check if username/email already exists (excluding current user)
            if (username) {
                const [existingUser] = await dbPool.execute<mysql.RowDataPacket[]>(
                    "SELECT user_id FROM users WHERE username = ? AND user_id != ?",
                    [username, userId]
                );
                if (existingUser.length > 0) {
                    set.status = 409;
                    return { error: "Username already taken" };
                }
            }

            if (email) {
                const [existingEmail] = await dbPool.execute<mysql.RowDataPacket[]>(
                    "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
                    [email, userId]
                );
                if (existingEmail.length > 0) {
                    set.status = 409;
                    return { error: "Email already in use" };
                }
            }

            // Build update query
            const updates = [];
            const values = [];

            if (username) {
                updates.push("username = ?");
                values.push(username);
            }
            if (email) {
                updates.push("email = ?");
                values.push(email);
            }
            if (role_id) {
                updates.push("role_id = ?");
                values.push(role_id);
            }
            if (currency_id) {
                updates.push("currency_id = ?");
                values.push(currency_id);
            }

            if (updates.length === 0) {
                return { message: "No changes made" };
            }

            values.push(userId);

            await dbPool.execute(
                `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`,
                values
            );

            return { message: "User updated successfully" };

        } catch (error) {
            console.error("Error updating user:", error);
            set.status = 500;
            return { error: "Internal Server Error" };
        }
    }, {
        body: t.Object({
            username: t.Optional(t.String()),
            email: t.Optional(t.String()),
            role_id: t.Optional(t.Numeric()),
            currency_id: t.Optional(t.Numeric()),
        })
    })

    // DELETE /admin/users/:id - Soft delete user
    .delete("/users/:id", async ({ headers, set, jwt, params }) => {
        const token = headers.authorization?.split(" ")[1];
        const isAdmin = await checkAdminAccess(token, jwt);

        if (!isAdmin) {
            set.status = 403;
            return { error: "Admin access required" };
        }

        const userId = params.id;

        try {
            await dbPool.execute(
                "UPDATE users SET is_deleted = 1 WHERE user_id = ?",
                [userId]
            );

            return { message: "User deleted successfully" };

        } catch (error) {
            console.error("Error deleting user:", error);
            set.status = 500;
            return { error: "Internal Server Error" };
        }
    })

    // GET /admin/products - Get all products across all bands
    .get("/products", async ({ headers, set, jwt, query }) => {
        const token = headers.authorization?.split(" ")[1];
        const isAdmin = await checkAdminAccess(token, jwt);

        if (!isAdmin) {
            set.status = 403;
            return { error: "Admin access required" };
        }

        // FIXED: Use String() to handle undefined values
        const page = Math.max(1, parseInt(String(query.page)) || 1);
        const limit = Math.max(1, parseInt(String(query.limit)) || 10);
        const offset = (page - 1) * limit;

        try {
            const [products] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
          p.product_id,
          p.name,
          p.price,
          p.description,
          p.category,
          p.image,
          p.is_deleted,
          b.name as band_name,
          b.band_id,
          COALESCE(i.quantity, 0) as stock,
          COUNT(DISTINCT op.order_id) as times_ordered
        FROM products p
        JOIN bands b ON p.band_id = b.band_id
        LEFT JOIN inventory i ON p.product_id = i.product_id AND i.branch_id = 1
        LEFT JOIN orders_products op ON p.product_id = op.product_id
        GROUP BY p.product_id
        ORDER BY p.product_id DESC
         LIMIT ${limit} OFFSET ${offset}
      `);

            const [total] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT COUNT(*) as total FROM products
      `);

            return {
                products,
                pagination: {
                    page,
                    limit,
                    total: total[0]?.total || 0,
                    total_pages: Math.ceil((total[0]?.total || 0) / limit)
                }
            };

        } catch (error) {
            console.error("Error fetching products:", error);
            set.status = 500;
            return { error: "Internal Server Error" };
        }
    })

    // DELETE /admin/products/:id - Delete any product
    .delete("/products/:id", async ({ headers, set, jwt, params }) => {
        const token = headers.authorization?.split(" ")[1];
        const isAdmin = await checkAdminAccess(token, jwt);

        if (!isAdmin) {
            set.status = 403;
            return { error: "Admin access required" };
        }

        const productId = params.id;

        try {
            await dbPool.execute(
                "UPDATE products SET is_deleted = 1 WHERE product_id = ?",
                [productId]
            );

            return { message: "Product deleted successfully" };

        } catch (error) {
            console.error("Error deleting product:", error);
            set.status = 500;
            return { error: "Internal Server Error" };
        }
    })

    // POST /admin/products - Create product for any band
    .post("/products", async ({ headers, set, jwt, body }) => {
        const token = headers.authorization?.split(" ")[1];
        const isAdmin = await checkAdminAccess(token, jwt);

        if (!isAdmin) {
            set.status = 403;
            return { error: "Admin access required" };
        }

        const { band_id, name, price, description, category, stock } = body;

        const connection = await dbPool.getConnection();
        await connection.beginTransaction();

        try {
            const imageData = {
                url: [
                    "https://via.placeholder.com/500x500.png?text=Product+Image",
                    "https://via.placeholder.com/500x500.png?text=Product+Image+2"
                ]
            };

            // Insert product
            const [result] = await connection.execute<mysql.OkPacket>(`
        INSERT INTO products (band_id, name, price, description, category, image)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [band_id, name, parseFloat(price), description, category, JSON.stringify(imageData)]);

            // Add to inventory
            await connection.execute(`
        INSERT INTO inventory (branch_id, product_id, quantity)
        VALUES (1, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + ?
      `, [result.insertId, stock, stock]);

            await connection.commit();

            set.status = 201;
            return {
                message: "Product created successfully",
                product_id: result.insertId
            };

        } catch (error) {
            await connection.rollback();
            console.error("Error creating product:", error);
            set.status = 500;
            return { error: "Internal Server Error" };
        } finally {
            connection.release();
        }
    }, {
        body: t.Object({
            band_id: t.Numeric(),
            name: t.String(),
            price: t.String(),
            description: t.String(),
            category: t.String(),
            stock: t.Numeric(),
        })
    })

    // GET /admin/bands - Get all bands for product creation
    .get("/bands", async ({ headers, set, jwt }) => {
        const token = headers.authorization?.split(" ")[1];
        const isAdmin = await checkAdminAccess(token, jwt);

        if (!isAdmin) {
            set.status = 403;
            return { error: "Admin access required" };
        }

        try {
            const [bands] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT band_id, name FROM bands WHERE is_deleted = 0
      `);

            return bands;

        } catch (error) {
            console.error("Error fetching bands:", error);
            set.status = 500;
            return { error: "Internal Server Error" };
        }
    });


