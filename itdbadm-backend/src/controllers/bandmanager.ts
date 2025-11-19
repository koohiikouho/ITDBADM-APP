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

    .get("/products", async ({ headers, set, jwt }) => {
        const token = headers.authorization?.split(" ")[1];
        const payload = await jwt.verify(token);

        if (!payload) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const userId = payload.id;

        try {
            const query = `
                SELECT 
                    p.product_id,
                    p.name,
                    p.price,
                    p.description,
                    p.category,
                    p.image,
                    p.is_deleted,
                    COALESCE(i.quantity, 0) as stock
                FROM products p
                JOIN bands b ON p.band_id = b.band_id
                LEFT JOIN inventory i ON p.product_id = i.product_id AND i.branch_id = 1
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

    // Create Product
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
            const { name, price, description, category, stock } = body;

            // Handle both string and number price
            const priceValue = typeof price === 'string' ? parseFloat(price) : price;
            const stockValue = typeof stock === 'string' ? parseInt(stock) : stock;

            if (isNaN(priceValue) || priceValue <= 0) {
                set.status = 400;
                return { error: "Invalid price" };
            }

            if (isNaN(stockValue) || stockValue < 0) {
                set.status = 400;
                return { error: "Invalid stock quantity" };
            }

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

                // Insert product - use the parsed price value
                const insertQuery = `
                    INSERT INTO products (band_id, name, price, description, category, image)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;

                const [result] = await connection.execute<mysql.OkPacket>(insertQuery, [
                    bandId,
                    name,
                    priceValue, // Use the parsed number
                    description,
                    category,
                    JSON.stringify(imageData)
                ]);

                // Add to inventory with specified stock quantity
                const inventoryQuery = `
                    INSERT INTO inventory (branch_id, product_id, quantity)
                    VALUES (1, ?, ?)
                    ON DUPLICATE KEY UPDATE quantity = quantity + ?
                `;

                await connection.execute(inventoryQuery, [result.insertId, stockValue, stockValue]);
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
                price: t.Union([t.String(), t.Number()]), // Accept both string and number
                description: t.String(),
                category: t.String(),
                stock: t.Union([t.String(), t.Number()]), // Add stock field
            })
        }
    )

    // Update Product
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
            const { name, price, description, category, stock } = body;

            const stockValue = typeof stock === 'string' ? parseInt(stock) : stock;

            if (isNaN(stockValue) || stockValue < 0) {
                set.status = 400;
                return { error: "Invalid stock quantity" };
            }

            const connection = await dbPool.getConnection();
            await connection.beginTransaction();

            try {
                // Verify user owns this product
                const [authRows] = await connection.execute<mysql.RowDataPacket[]>(
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

                await connection.execute(updateQuery, [
                    name,
                    parseFloat(price),
                    description,
                    category,
                    JSON.stringify(imageData),
                    productId
                ]);

                // Update inventory stock
                const updateInventoryQuery = `
                    UPDATE inventory 
                    SET quantity = ? 
                    WHERE product_id = ?
                `;

                await connection.execute(updateInventoryQuery, [stockValue, productId]);

                await connection.commit();
                return { message: "Product updated successfully" };

            } catch (error) {
                await connection.rollback();
                console.error("Error updating product:", error);
                set.status = 500;
                return { error: "Internal Server Error while updating product" };
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
                stock: t.Union([t.String(), t.Number()]), // Add stock field
            })
        }
    )
    
    // Update Product Stock Only
    .patch(
        "/products/:id/stock",
        async ({ headers, set, jwt, params, body }) => {
            const token = headers.authorization?.split(" ")[1];
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { error: "Unauthorized" };
            }

            const userId = payload.id;
            const productId = params.id;
            const { stock } = body;

            const stockValue = typeof stock === 'string' ? parseInt(stock) : stock;

            if (isNaN(stockValue) || stockValue < 0) {
                set.status = 400;
                return { error: "Invalid stock quantity" };
            }

            const connection = await dbPool.getConnection();

            try {
                // Verify ownership
                 const [authRows] = await connection.execute<mysql.RowDataPacket[]>(
                    `SELECT p.product_id 
                    FROM products p 
                    JOIN bands b ON p.band_id = b.band_id 
                    WHERE p.product_id = ? AND b.manager_id = ?`,
                    [productId, userId]
                );

                if (authRows.length === 0) {
                    set.status = 403;
                    return { error: "You are not authorized to update this product" };
                }

                // Update inventory
                const updateInventoryQuery = `
                    UPDATE inventory 
                    SET quantity = ? 
                    WHERE product_id = ?
                `;

                await connection.execute(updateInventoryQuery, [stockValue, productId]);

                return { message: "Stock updated successfully", newStock: stockValue };

            } catch (error) {
                console.error("Error updating stock:", error);
                set.status = 500;
                return { error: "Internal Server Error" };
            } finally {
                connection.release();
            }
        },
        {
            body: t.Object({
                stock: t.Union([t.String(), t.Number()])
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

    .get("/products/:id/stock", async ({ headers, set, jwt, params }) => {
        const token = headers.authorization?.split(" ")[1];
        const payload = await jwt.verify(token);

        if (!payload) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const userId = payload.id;
        const productId = params.id;

        try {
            const query = `
                SELECT COALESCE(i.quantity, 0) as stock
                FROM products p
                JOIN bands b ON p.band_id = b.band_id
                LEFT JOIN inventory i ON p.product_id = i.product_id
                WHERE p.product_id = ? AND b.manager_id = ? AND p.is_deleted = 0
            `;

            const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query, [productId, userId]);

            if (rows.length === 0) {
                set.status = 404;
                return { error: "Product not found" };
            }

            return { stock: rows[0]!.stock };
        } catch (error) {
            console.error("Error fetching product stock:", error);
            set.status = 500;
            return { error: "Internal Server Error while retrieving stock" };
        }
    })

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
    })

    // GET /band-manager/schedule
    .get("/schedule", async ({ headers, set, jwt }) => {
        const token = headers.authorization?.split(" ")[1];
        const payload = await jwt.verify(token);

        if (!payload) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const userId = payload.id;

        try {
            // 1. Get the band ID managed by the user
            const [bandRows] = await dbPool.execute<mysql.RowDataPacket[]>(
                "SELECT band_id FROM bands WHERE manager_id = ? AND is_deleted = 0",
                [userId]
            );

            if (bandRows.length === 0) {
                set.status = 404;
                return { error: "No band found for this manager" };
            }

            const bandId = bandRows[0]?.band_id;

            // 2. Fetch the schedule
            const [scheduleRows] = await dbPool.execute<mysql.RowDataPacket[]>(
                `SELECT monday, tuesday, wednesday, thursday, friday, saturday, sunday, vacation FROM schedule WHERE band_id = ?`,
                [bandId]
            );

            if (scheduleRows.length === 0) {
                // Return a default schedule if none exists yet
                return {
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: true,
                    sunday: true,
                    vacation: false
                };
            }

            const schedule = scheduleRows[0];
            // Convert MySQL tinyint(1) (0/1) to boolean
            return {
                monday: schedule?.monday === 1,
                tuesday: schedule?.tuesday === 1,
                wednesday: schedule?.wednesday === 1,
                thursday: schedule?.thursday === 1,
                friday: schedule?.friday === 1,
                saturday: schedule?.saturday === 1,
                sunday: schedule?.sunday === 1,
                vacation: schedule?.vacation === 1,
            };
        } catch (error) {
            console.error("Error fetching schedule:", error);
            set.status = 500;
            return { error: "Internal Server Error while retrieving schedule" };
        }
    })

    // Update band schedule
    // PUT /band-manager/schedule
    .put(
        "/schedule",
        async ({ headers, set, jwt, body }) => {
            const token = headers.authorization?.split(" ")[1];
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { error: "Unauthorized" };
            }

            const userId = payload.id;
            const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, vacation } = body;

            try {
                // 1. Get the band ID managed by the user
                const [bandRows] = await dbPool.execute<mysql.RowDataPacket[]>(
                    "SELECT band_id FROM bands WHERE manager_id = ? AND is_deleted = 0",
                    [userId]
                );

                if (bandRows.length === 0) {
                    set.status = 404;
                    return { error: "No band found for this manager" };
                }

                const bandId = bandRows[0]?.band_id;

                // Helper to convert boolean to MySQL tinyint(1) (0 or 1)
                const boolToTinyInt = (bool: boolean) => (bool ? 1 : 0);

                // 2. Check if a schedule entry already exists
                const [checkRows] = await dbPool.execute<mysql.RowDataPacket[]>(
                    "SELECT band_id FROM schedule WHERE band_id = ?",
                    [bandId]
                );

                if (checkRows.length === 0) {
                    // If no schedule exists, insert a new entry
                    const insertQuery = `
                        INSERT INTO schedule (band_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday, vacation)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    await dbPool.execute(insertQuery, [
                        bandId,
                        boolToTinyInt(monday),
                        boolToTinyInt(tuesday),
                        boolToTinyInt(wednesday),
                        boolToTinyInt(thursday),
                        boolToTinyInt(friday),
                        boolToTinyInt(saturday),
                        boolToTinyInt(sunday),
                        boolToTinyInt(vacation),
                    ]);
                } else {
                    // If a schedule exists, update the entry using the stored procedure
                    await dbPool.execute(`CALL sp_update_band_schedule(?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                        bandId,
                        boolToTinyInt(monday),
                        boolToTinyInt(tuesday),
                        boolToTinyInt(wednesday),
                        boolToTinyInt(thursday),
                        boolToTinyInt(friday),
                        boolToTinyInt(saturday),
                        boolToTinyInt(sunday),
                        boolToTinyInt(vacation),
                    ]);
                }


                return { message: "Schedule updated successfully" };
            } catch (error) {
                console.error("Error updating schedule:", error);
                set.status = 500;
                return { error: "Internal Server Error while updating schedule" };
            }
        },
        {
            body: t.Object({
                monday: t.Boolean(),
                tuesday: t.Boolean(),
                wednesday: t.Boolean(),
                thursday: t.Boolean(),
                friday: t.Boolean(),
                saturday: t.Boolean(),
                sunday: t.Boolean(),
                vacation: t.Boolean(),
            }),
        }
    )

    // GET /band-manager/orders - Get all orders containing band's products
    .get("/orders", async ({ headers, set, jwt }) => {
        const token = headers.authorization?.split(" ")[1];
        const payload = await jwt.verify(token);

        if (!payload) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const userId = payload.id;

        try {
            // Fetch orders that contain items from the band managed by this user
            // We only aggregate items belonging to this band, not the whole user order
            const query = `
                SELECT 
                    o.order_id,
                    o.order_date,
                    o.status,
                    u.username as customer_name,
                    si.first_name,
                    si.last_name,
                    si.address,
                    si.city,
                    si.country,
                    si.postal_code,
                    si.contact_information,
                    SUM(op.quantity * p.price) as band_total,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'product_name', p.name,
                            'quantity', op.quantity,
                            'price', p.price,
                            'image', p.image
                        )
                    ) as items
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                LEFT JOIN shipping_information si ON o.shipping_id = si.shipping_id
                JOIN orders_products op ON o.order_id = op.order_id
                JOIN products p ON op.product_id = p.product_id
                JOIN bands b ON p.band_id = b.band_id
                WHERE b.manager_id = ?
                GROUP BY o.order_id, o.order_date, o.status, u.username, si.shipping_id
                ORDER BY o.order_date DESC
            `;

            const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query, [userId]);

            // Parse the items JSON string if necessary (mysql2 might return it as string)
            const orders = rows.map((row: any) => ({
                ...row,
                // Ensure items is an array (it might come as a string from JSON_ARRAYAGG depending on driver version)
                items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
            }));

            return orders;

        } catch (error) {
            console.error("Error fetching band orders:", error);
            set.status = 500;
            return { error: "Internal Server Error while retrieving orders" };
        }
    });