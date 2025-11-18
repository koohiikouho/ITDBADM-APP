import { Elysia, t } from "elysia";
import { dbPool } from "../db";
import mysql from "mysql2/promise";
import { jwt } from "@elysiajs/jwt";

export const bandManagerController = new Elysia({ prefix: "/band-manager" })
    .use(
        jwt({
            name: "jwt",
            secret: process.env.JWT_SECRET as string,
            exp: "1d",
        })
    )

    .get("/band", async ({ headers, set, jwt }) => {
        const token = headers.authorization?.split(" ")[1];
        const payload = await jwt.verify(token);

        if (!payload) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const userId = payload.id;

        try {
            // band managed by this user
            const query = `
        SELECT 
          b.band_id,
          b.name,
          b.genre,
          b.description,
          b.iframe_string,
          b.pfp_string,
          b.branch_id,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'member_name', bm.member_name,
              'band_role', bm.band_role
            )
          ) as member_list
        FROM bands b
        LEFT JOIN band_members bm ON b.band_id = bm.band_id
        WHERE b.manager_id = ? AND b.is_deleted = 0
        GROUP BY b.band_id
      `;

            const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query, [userId]);

            if (rows.length === 0) {
                set.status = 404;
                return { error: "No band found for this manager" };
            }

            return rows[0];
        } catch (error) {
            console.error("Error fetching band data:", error);
            set.status = 500;
            return { error: "Internal Server Error while retrieving band data" };
        }
    })

    // update band information
    .put(
        "/band",
        async ({ headers, set, jwt, body }) => {
            const token = headers.authorization?.split(" ")[1];
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { error: "Unauthorized" };
            }

            const userId = payload.id;
            const { band_id, name, genre, description, iframe_string, pfp_string, member_list } = body;

            const connection = await dbPool.getConnection();
            await connection.beginTransaction();

            try {
                // verify user manages this band
                const [authRows] = await connection.execute<mysql.RowDataPacket[]>(
                    "SELECT band_id FROM bands WHERE band_id = ? AND manager_id = ?",
                    [band_id, userId]
                );

                if (authRows.length === 0) {
                    set.status = 403;
                    return { error: "You are not authorized to manage this band" };
                }

                // update band basic info
                const updateBandQuery = `
          UPDATE bands 
          SET name = ?, genre = ?, description = ?, iframe_string = ?, pfp_string = ?
          WHERE band_id = ?
        `;

                await connection.execute(updateBandQuery, [
                    name,
                    genre,
                    description,
                    iframe_string,
                    pfp_string,
                    band_id
                ]);

                // update band members - first remove existing members
                await connection.execute(
                    "DELETE FROM band_members WHERE band_id = ?",
                    [band_id]
                );

                // insert new members
                if (member_list && Array.isArray(member_list)) {
                    for (const member of member_list) {
                        await connection.execute(
                            "INSERT INTO band_members (band_id, member_name, band_role) VALUES (?, ?, ?)",
                            [band_id, member.member_name, member.band_role]
                        );
                    }
                }

                await connection.commit();
                return { message: "Band updated successfully" };

            } catch (error) {
                await connection.rollback();
                console.error("Error updating band:", error);
                set.status = 500;
                return { error: "Internal Server Error while updating band" };
            } finally {
                connection.release();
            }
        },
        {
            body: t.Object({
                band_id: t.Numeric(),
                name: t.String(),
                genre: t.String(),
                description: t.String(),
                iframe_string: t.String(),
                pfp_string: t.String(),
                member_list: t.Array(
                    t.Object({
                        member_name: t.String(),
                        band_role: t.String()
                    })
                )
            })
        }
    )

    // all products for managed band
    .get("/products", async ({ headers, set, jwt }) => {
        const token = headers.authorization?.split(" ")[1];
        const payload = await jwt.verify(token);

        if (!payload) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const userId = payload.id;

        try {
            // get products for band managed by user
            const query = `
        SELECT 
          p.product_id,
          p.name,
          p.price,
          p.description,
          p.category,
          p.image,
          p.is_deleted
        FROM products p
        JOIN bands b ON p.band_id = b.band_id
        WHERE b.manager_id = ? AND p.is_deleted = 0
        ORDER BY p.product_id DESC
      `;

            const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query, [userId]);

            return rows;
        } catch (error) {
            console.error("Error fetching products:", error);
            set.status = 500;
            return { error: "Internal Server Error while retrieving products" };
        }
    })

    // Create product
    .post(
        "/products",
        async ({ headers, set, jwt, body }) => {
            const token = headers.authorization?.split(" ")[1];
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { error: "Unauthorized" };
            }

            const userId = payload.id;
            const { name, price, description, category } = body;

            // temp image data will update cloudinary later
            const imageUrls = [
                "https://via.placeholder.com/500x500.png?text=Product+Image",
                "https://via.placeholder.com/500x500.png?text=Product+Image+2"
            ];

            const connection = await dbPool.getConnection();
            await connection.beginTransaction();

            try {
                const [bandRows] = await connection.execute<mysql.RowDataPacket[]>(
                    "SELECT band_id FROM bands WHERE manager_id = ? AND is_deleted = 0",
                    [userId]
                );

                if (bandRows.length === 0) {
                    set.status = 404;
                    return { error: "No band found for this manager" };
                }

                const bandId = bandRows[0]?.band_id;

                const imageData = {
                    url: imageUrls
                };

                // Insert product
                const insertQuery = `
                    INSERT INTO products (band_id, name, price, description, category, image)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;

                const [result] = await connection.execute<mysql.OkPacket>(insertQuery, [
                    bandId,
                    name,
                    parseFloat(price),
                    description,
                    category,
                    JSON.stringify(imageData)
                ]);

                // Add to inventory default branch 1
                const inventoryQuery = `
                    INSERT INTO inventory (branch_id, product_id, quantity)
                    VALUES (1, ?, 10)
                    ON DUPLICATE KEY UPDATE quantity = quantity + 10
                `;

                await connection.execute(inventoryQuery, [result.insertId]);
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
                return { error: "Internal Server Error while creating product" };
            } finally {
                connection.release();
            }
        },
        {
            body: t.Object({
                name: t.String(),
                price: t.String(),
                description: t.String(),
                category: t.String(),
            })
        }
    )

    .put(
        "/products/:id",
        async ({ headers, set, jwt, params, body }) => {
            const token = headers.authorization?.split(" ")[1];
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { error: "Unauthorized" };
            }

            const userId = payload.id;
            const productId = params.id;
            const { name, price, description, category } = body;

            try {
                // Verify user owns this product
                const [authRows] = await dbPool.execute<mysql.RowDataPacket[]>(
                    `SELECT p.product_id, p.image
                    FROM products p 
                    JOIN bands b ON p.band_id = b.band_id 
                    WHERE p.product_id = ? AND b.manager_id = ?`,
                    [productId, userId]
                );

                if (authRows.length === 0) {
                    set.status = 403;
                    return { error: "You are not authorized to edit this product" };
                }

                // default placeholder
                const existingImage = authRows[0]?.image;
                const imageData = existingImage
                    ? (typeof existingImage === 'string' ? JSON.parse(existingImage) : existingImage)
                    : { url: ["https://via.placeholder.com/500x500.png?text=Product+Image"] };

                // Update product
                const updateQuery = `
                    UPDATE products 
                    SET name = ?, price = ?, description = ?, category = ?, image = ?
                    WHERE product_id = ?
                `;

                await dbPool.execute(updateQuery, [
                    name,
                    parseFloat(price),
                    description,
                    category,
                    JSON.stringify(imageData),
                    productId
                ]);

                return { message: "Product updated successfully" };

            } catch (error) {
                console.error("Error updating product:", error);
                set.status = 500;
                return { error: "Internal Server Error while updating product" };
            }
        },
        {
            body: t.Object({
                name: t.String(),
                price: t.String(),
                description: t.String(),
                category: t.String(),
            })
        }
    )

    .delete(
        "/products/:id",
        async ({ headers, set, jwt, params }) => {
            const token = headers.authorization?.split(" ")[1];
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { error: "Unauthorized" };
            }

            const userId = payload.id;
            const productId = params.id;

            try {
                // Verify user owns this product
                const [authRows] = await dbPool.execute<mysql.RowDataPacket[]>(
                    `SELECT p.product_id 
                    FROM products p 
                    JOIN bands b ON p.band_id = b.band_id 
                    WHERE p.product_id = ? AND b.manager_id = ?`,
                    [productId, userId]
                );

                if (authRows.length === 0) {
                    set.status = 403;
                    return { error: "You are not authorized to delete this product" };
                }

                // Soft delete the product
                await dbPool.execute(
                    "UPDATE products SET is_deleted = 1 WHERE product_id = ?",
                    [productId]
                );

                return { message: "Product deleted successfully" };

            } catch (error) {
                console.error("Error deleting product:", error);
                set.status = 500;
                return { error: "Internal Server Error while deleting product" };
            }
        }
    )

    .get("/stats", async ({ headers, set, jwt }) => {
        const token = headers.authorization?.split(" ")[1];
        const payload = await jwt.verify(token);

        if (!payload) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const userId = payload.id;

        try {
            const [bandRows] = await dbPool.execute<mysql.RowDataPacket[]>(
                "SELECT band_id FROM bands WHERE manager_id = ? AND is_deleted = 0",
                [userId]
            );

            if (bandRows.length === 0) {
                return {
                    totalProducts: 0,
                    totalBookings: 0,
                    pendingOffers: 0,
                    revenue: 0,
                    revenueChange: 0
                };
            }

            const bandId = bandRows[0]?.band_id;

            // product count
            const [productRows] = await dbPool.execute<mysql.RowDataPacket[]>(
                "SELECT COUNT(*) as count FROM products WHERE band_id = ? AND is_deleted = 0",
                [bandId]
            );

            // booking stats
            const [bookingRows] = await dbPool.execute<mysql.RowDataPacket[]>(
                `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending
         FROM booking_offers 
         WHERE band_id = ?`,
                [bandId]
            );

            // orders linked to products of band
            const [revenueRows] = await dbPool.execute<mysql.RowDataPacket[]>(
                `SELECT 
          COALESCE(SUM(op.quantity * p.price), 0) as revenue
         FROM orders_products op
         JOIN products p ON op.product_id = p.product_id
         JOIN orders o ON op.order_id = o.order_id
         WHERE p.band_id = ? AND o.status != 'Cancelled'`,
                [bandId]
            );

            const stats = {
                totalProducts: productRows[0]?.count || 0,
                totalBookings: bookingRows[0]?.total || 0,
                pendingOffers: bookingRows[0]?.pending || 0,
                revenue: parseFloat(revenueRows[0]?.revenue) || 0,
                revenueChange: 12.5 // temp mock data
            };

            return stats;

        } catch (error) {
            console.error("Error fetching stats:", error);
            set.status = 500;
            return { error: "Internal Server Error while retrieving stats" };
        }
    });