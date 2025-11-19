import { Elysia, t } from "elysia";
import { dbPool } from "../db";
import mysql from "mysql2/promise";
import { jwt } from "@elysiajs/jwt";
import { deleteFromCloudinary, extractPublicId, uploadToCloudinary } from "../config/cloudinary";
import { RowDataPacket } from "mysql2";

interface RecentActivity {
    type: 'order' | 'booking' | 'review';
    title: string;
    description: string;
    timestamp: string;
    amount?: number;
    status?: string;
}

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
            const { band_id, name, genre, description, iframe_string, member_list } = body;

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
          SET name = ?, genre = ?, description = ?, iframe_string = ?
          WHERE band_id = ?
        `;

                await connection.execute(updateBandQuery, [
                    name,
                    genre,
                    description,
                    iframe_string,
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
                // Allow String OR Null for these fields
                genre: t.Union([t.String(), t.Null()]),
                description: t.Union([t.String(), t.Null()]),
                iframe_string: t.Union([t.String(), t.Null()]),
                pfp_string: t.Union([t.String(), t.Null()]),
                member_list: t.Optional(t.Array(
                    t.Object({
                        member_name: t.String(),
                        band_role: t.String()
                    })
                ))
            })
        }
    )


    .put(
        "/band/pfp",
        async ({ headers, set, jwt, request }) => {
            const token = headers.authorization?.split(" ")[1];
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { error: "Unauthorized" };
            }

            const userId = payload.id;

            // form data
            const formData = await request.formData();
            const imageFile = formData.get('pfp') as File;

            if (!imageFile || imageFile.size === 0) {
                set.status = 400;
                return { error: "No image file provided" };
            }

            const connection = await dbPool.getConnection();
            await connection.beginTransaction();

            try {
                // get current pfp
                const [bandRows] = await connection.execute<mysql.RowDataPacket[]>(
                    "SELECT band_id, pfp_string FROM bands WHERE manager_id = ? AND is_deleted = 0",
                    [userId]
                );

                if (bandRows.length === 0) {
                    set.status = 404;
                    return { error: "No band found for this manager" };
                }

                const bandId = bandRows[0]?.band_id;
                const currentPfp = bandRows[0]?.pfp_string;

                // delete old profile picture from Cloudinary if it exists and is from Cloudinary
                if (currentPfp && currentPfp.includes('cloudinary')) {
                    try {
                        const publicId = extractPublicId(currentPfp);
                        if (publicId) {
                            await deleteFromCloudinary(publicId);
                        }
                    } catch (deleteError) {
                        console.error("Error deleting old profile picture:", deleteError);
                        // Continue with upload even if deletion fails
                    }
                }

                // upload new profile picture to Cloudinary
                const arrayBuffer = await imageFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                let imageUrl: string;
                try {
                    imageUrl = await uploadToCloudinary(buffer, `band-${bandId}/profile`);
                } catch (uploadError) {
                    console.error("Cloudinary upload error:", uploadError);
                    set.status = 500;
                    return { error: "Failed to upload image to Cloudinary" };
                }

                // Update database
                const updateQuery = `
                    UPDATE bands 
                    SET pfp_string = ?
                    WHERE band_id = ? AND manager_id = ?
                `;

                await connection.execute(updateQuery, [imageUrl, bandId, userId]);
                await connection.commit();

                return {
                    message: "Profile picture updated successfully",
                    pfp_url: imageUrl
                };

            } catch (error) {
                await connection.rollback();
                console.error("Error updating profile picture:", error);
                set.status = 500;
                return { error: "Internal Server Error while updating profile picture" };
            } finally {
                connection.release();
            }
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



    .post(
        "/products",
        async ({ headers, set, jwt, request }) => {
            const token = headers.authorization?.split(" ")[1];
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { error: "Unauthorized" };
            }

            const userId = payload.id;

            // Parse form data first
            const formData = await request.formData();

            // Extract text fields from formData
            const name = formData.get('name') as string;
            const price = formData.get('price') as string;
            const description = formData.get('description') as string;
            const category = formData.get('category') as string;
            const stock = formData.get('stock') as string;
            const imageFiles = formData.getAll('images') as File[];

            // Validate required fields
            if (!name || !price || !category || !stock) {
                set.status = 400;
                return { error: "Missing required fields" };
            }

            const priceValue = parseFloat(price);
            const stockValue = parseInt(stock);

            if (isNaN(priceValue) || priceValue <= 0) {
                set.status = 400;
                return { error: "Invalid price" };
            }

            if (isNaN(stockValue) || stockValue < 0) {
                set.status = 400;
                return { error: "Invalid stock quantity" };
            }

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

                let imageUrls: string[] = [];

                // Cloudinary upload
                if (imageFiles && imageFiles.length > 0) {
                    for (const file of imageFiles) {
                        if (file.size > 0) {
                            const arrayBuffer = await file.arrayBuffer();
                            const buffer = Buffer.from(arrayBuffer);

                            try {
                                const imageUrl = await uploadToCloudinary(buffer, `band-${bandId}/products`);
                                imageUrls.push(imageUrl);
                            } catch (uploadError) {
                                console.error("Cloudinary upload error:", uploadError);
                            }
                        }
                    }
                }

                if (imageUrls.length === 0) {
                    imageUrls = ["https://res.cloudinary.com/dkuf0peg7/image/upload/v1763529474/band-6/products/kbc3gvzcnhbjxb39gohs.jpg"];
                }

                const imageData = {
                    url: imageUrls
                };

                const insertQuery = `
            INSERT INTO products (band_id, name, price, description, category, image)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

                const [result] = await connection.execute<mysql.OkPacket>(insertQuery, [
                    bandId,
                    name,
                    priceValue,
                    description,
                    category,
                    JSON.stringify(imageData)
                ]);

                // Add to inventory
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
                    product_id: result.insertId,
                    images: imageUrls
                };

            } catch (error) {
                await connection.rollback();
                console.error("Error creating product:", error);
                set.status = 500;
                return { error: "Internal Server Error while creating product" };
            } finally {
                connection.release();
            }
        }
    )

    .put(
        "/products/:id",
        async ({ headers, set, jwt, params, request }) => {
            const token = headers.authorization?.split(" ")[1];
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { error: "Unauthorized" };
            }

            const userId = payload.id;
            const productId = params.id;

            // Parse form data first
            const formData = await request.formData();

            // Extract text fields from formData
            const name = formData.get('name') as string;
            const price = formData.get('price') as string;
            const description = formData.get('description') as string;
            const category = formData.get('category') as string;
            const stock = formData.get('stock') as string;
            const imageFiles = formData.getAll('images') as File[];

            // NEW: Extract existingImages and removedImages
            const existingImagesJson = formData.get('existingImages') as string;
            const removedImagesJson = formData.get('removedImages') as string;

            let existingImages: string[] = [];
            let removedImages: string[] = [];

            try {
                if (existingImagesJson) {
                    existingImages = JSON.parse(existingImagesJson);
                }
                if (removedImagesJson) {
                    removedImages = JSON.parse(removedImagesJson);
                }
            } catch (error) {
                console.error("Error parsing image arrays:", error);
            }

            // Validate required fields
            if (!name || !price || !category || !stock) {
                set.status = 400;
                return { error: "Missing required fields" };
            }

            const stockValue = parseInt(stock);
            if (isNaN(stockValue) || stockValue < 0) {
                set.status = 400;
                return { error: "Invalid stock quantity" };
            }

            const connection = await dbPool.getConnection();
            await connection.beginTransaction();

            try {
                // Verify user owns this product
                const [authRows] = await connection.execute<mysql.RowDataPacket[]>(
                    `SELECT p.product_id, p.image, p.band_id
                    FROM products p 
                    JOIN bands b ON p.band_id = b.band_id 
                    WHERE p.product_id = ? AND b.manager_id = ?`,
                    [productId, userId]
                );

                if (authRows.length === 0) {
                    set.status = 403;
                    return { error: "You are not authorized to edit this product" };
                }

                const bandId = authRows[0]?.band_id;
                let imageData;

                // Get current images from database
                const currentImage = authRows[0]?.image;
                const currentUrls = currentImage
                    ? (typeof currentImage === 'string' ? JSON.parse(currentImage).url : currentImage.url)
                    : [];

                // Start with existing images that should remain
                let finalImageUrls = [...existingImages];

                // Upload new images if any
                if (imageFiles && imageFiles.length > 0 && imageFiles[0]!.size > 0) {
                    const newImageUrls: string[] = [];

                    for (const file of imageFiles) {
                        if (file.size > 0) {
                            const arrayBuffer = await file.arrayBuffer();
                            const buffer = Buffer.from(arrayBuffer);

                            try {
                                const imageUrl = await uploadToCloudinary(buffer, `band-${bandId}/products`);
                                newImageUrls.push(imageUrl);
                            } catch (uploadError) {
                                console.error("Cloudinary upload error:", uploadError);
                            }
                        }
                    }

                    // Add new images to the final array
                    finalImageUrls = [...finalImageUrls, ...newImageUrls];
                }

                // Delete removed images from Cloudinary
                if (removedImages.length > 0) {
                    for (const removedImageUrl of removedImages) {
                        try {
                            const publicId = extractPublicId(removedImageUrl);
                            if (publicId) {
                                await deleteFromCloudinary(publicId);
                            }
                        } catch (deleteError) {
                            console.error("Error deleting image from Cloudinary:", deleteError);
                            // Continue even if deletion fails
                        }
                    }
                }

                // Ensure we have at least one image
                if (finalImageUrls.length === 0) {
                    finalImageUrls = ["https://res.cloudinary.com/dkuf0peg7/image/upload/v1763529474/band-6/products/kbc3gvzcnhbjxb39gohs.jpg"];
                }

                imageData = { url: finalImageUrls };

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

    // GET /band-manager/recent-activity
    .get("/recent-activity", async ({ headers, set, jwt }) => {
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
                return [];
            }

            const bandId = bandRows[0]?.band_id;

            // Get recent orders for this band's products
            const [orderRows] = await dbPool.execute<mysql.RowDataPacket[]>(`
            SELECT 
                o.order_id,
                o.order_date,
                o.price as amount,
                u.username as customer_name,
                JSON_ARRAYAGG(p.name) as product_names,
                'order' as type
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            JOIN orders_products op ON o.order_id = op.order_id
            JOIN products p ON op.product_id = p.product_id
            WHERE p.band_id = ? AND o.status != 'Cancelled'
            GROUP BY o.order_id, o.order_date, o.price, u.username
            ORDER BY o.order_date DESC
            LIMIT 10
        `, [bandId]);

            // Get recent booking offers
            const [bookingRows] = await dbPool.execute<mysql.RowDataPacket[]>(`
            SELECT 
                offer_id,
                booking_date,
                price as amount,
                description,
                status,
                'booking' as type
            FROM booking_offers 
            WHERE band_id = ?
            ORDER BY date_created DESC
            LIMIT 10
        `, [bandId]);

            const activities: RecentActivity[] = [];

            // Process orders
            orderRows.forEach((row: any) => {
                activities.push({
                    type: 'order',
                    title: 'New Order Received',
                    description: `Order from ${row.customer_name} for ${row.product_names.join(', ')}`,
                    timestamp: new Date(row.order_date).toLocaleDateString(),
                    amount: parseFloat(row.amount)
                });
            });

            // Process bookings
            bookingRows.forEach((row: any) => {
                activities.push({
                    type: 'booking',
                    title: `Booking ${row.status}`,
                    description: `Booking request for ${new Date(row.booking_date).toLocaleDateString()}`,
                    timestamp: new Date(row.booking_date).toLocaleDateString(),
                    amount: parseFloat(row.amount),
                    status: row.status
                });
            });

            // Sort by timestamp (most recent first) and limit to 10
            activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            return activities.slice(0, 10);

        } catch (error) {
            console.error("Error fetching recent activity:", error);
            set.status = 500;
            return { error: "Internal Server Error while retrieving recent activity" };
        }
    })

    // GET /band-manager/performance - Updated with factual data
    .get("/performance", async ({ headers, set, jwt }) => {
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
                    salesRate: 0,
                    bookingConversion: 0,
                    inventoryHealth: 0,
                    totalUnitsSold: 0,
                    avgBookingPrice: 0
                };
            }

            const bandId = bandRows[0]?.band_id;

            // Calculate sales rate (percentage of inventory sold)
            const [salesRateRows] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
            COALESCE(SUM(op.quantity), 0) as total_sold,
            COALESCE(SUM(i.quantity), 0) as total_inventory
        FROM products p
        LEFT JOIN inventory i ON p.product_id = i.product_id
        LEFT JOIN orders_products op ON p.product_id = op.product_id
        LEFT JOIN orders o ON op.order_id = o.order_id AND o.status != 'Cancelled'
        WHERE p.band_id = ? AND p.is_deleted = 0
        `, [bandId]);

            const totalSold = salesRateRows[0]?.total_sold || 0;
            const totalInventory = salesRateRows[0]?.total_inventory || 0;
            const totalStock = totalSold + totalInventory;
            const salesRate = totalStock > 0 ? Math.round((totalSold / totalStock) * 100) : 0;

            // Calculate booking conversion rate
            const [bookingRows] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
            COUNT(*) as total_offers,
            SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted_offers,
            AVG(CASE WHEN status = 'Accepted' THEN price ELSE NULL END) as avg_accepted_price
        FROM booking_offers 
        WHERE band_id = ?
        `, [bandId]);

            const totalOffers = bookingRows[0]?.total_offers || 0;
            const acceptedOffers = bookingRows[0]?.accepted_offers || 0;
            const bookingConversion = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 0;
            const avgBookingPrice = parseFloat(bookingRows[0]?.avg_accepted_price) || 0;

            // Calculate inventory health (percentage of products with stock > 0)
            const [inventoryRows] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
            COUNT(*) as total_products,
            SUM(CASE WHEN i.quantity > 0 THEN 1 ELSE 0 END) as in_stock_products
        FROM products p
        LEFT JOIN inventory i ON p.product_id = i.product_id
        WHERE p.band_id = ? AND p.is_deleted = 0
        `, [bandId]);

            const totalProducts = inventoryRows[0]?.total_products || 0;
            const inStockProducts = inventoryRows[0]?.in_stock_products || 0;
            const inventoryHealth = totalProducts > 0 ? Math.round((inStockProducts / totalProducts) * 100) : 0;

            // Get top selling product
            const [topProductRows] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
            p.name,
            SUM(op.quantity) as total_sold
        FROM products p
        JOIN orders_products op ON p.product_id = op.product_id
        JOIN orders o ON op.order_id = o.order_id AND o.status != 'Cancelled'
        WHERE p.band_id = ? AND p.is_deleted = 0
        GROUP BY p.product_id, p.name
        ORDER BY total_sold DESC
        LIMIT 1
        `, [bandId]);

            const topSellingProduct = topProductRows.length > 0 ? topProductRows[0]?.name : undefined;

            return {
                salesRate,
                bookingConversion,
                inventoryHealth,
                totalUnitsSold: totalSold,
                avgBookingPrice,
                topSellingProduct
            };

        } catch (error) {
            console.error("Error fetching performance metrics:", error);
            set.status = 500;
            return { error: "Internal Server Error while retrieving performance metrics" };
        }
    })

    // GET /band-manager/analytics - Enhanced with more factual data
    .get("/analytics", async ({ headers, set, jwt }) => {
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
                    revenueData: [],
                    productPerformance: [],
                    bookingAnalytics: {},
                    customerInsights: {},
                    inventoryAnalysis: {},
                    salesTrends: []
                };
            }

            const bandId = bandRows[0]?.band_id;

            // Revenue data for the last 6 months
            const [revenueRows] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
            DATE_FORMAT(o.order_date, '%Y-%m') as month,
            SUM(op.quantity * p.price) as revenue,
            SUM(op.quantity) as units_sold
        FROM orders o
        JOIN orders_products op ON o.order_id = op.order_id
        JOIN products p ON op.product_id = p.product_id
        WHERE p.band_id = ? 
            AND o.status != 'Cancelled'
            AND o.order_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
        ORDER BY month
        `, [bandId]);

            // Product performance with more details
            const [productRows] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
            p.product_id,
            p.name,
            p.category,
            p.price,
            SUM(COALESCE(op.quantity, 0)) as units_sold,
            SUM(COALESCE(op.quantity, 0) * p.price) as revenue,
            COALESCE(i.quantity, 0) as current_stock,
            CASE 
            WHEN COALESCE(i.quantity, 0) = 0 THEN 'Out of Stock'
            WHEN COALESCE(i.quantity, 0) <= 10 THEN 'Low Stock'
            ELSE 'In Stock'
            END as stock_status
        FROM products p
        LEFT JOIN orders_products op ON p.product_id = op.product_id
        LEFT JOIN orders o ON op.order_id = o.order_id AND o.status != 'Cancelled'
        LEFT JOIN inventory i ON p.product_id = i.product_id
        WHERE p.band_id = ? AND p.is_deleted = 0
        GROUP BY p.product_id, p.name, p.category, p.price, i.quantity
        ORDER BY revenue DESC
        `, [bandId]);

            // Booking analytics with timeline
            const [bookingRows] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
            status,
            COUNT(*) as count,
            AVG(price) as avg_price,
            MIN(booking_date) as earliest_booking,
            MAX(booking_date) as latest_booking
        FROM booking_offers 
        WHERE band_id = ?
        GROUP BY status
        `, [bandId]);

            // Customer insights with purchase frequency
            const [customerRows] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
            COUNT(DISTINCT o.user_id) as unique_customers,
            COUNT(DISTINCT o.order_id) as total_orders,
            AVG(op.quantity * p.price) as avg_order_value,
            MAX(o.order_date) as last_order_date
        FROM orders o
        JOIN orders_products op ON o.order_id = op.order_id
        JOIN products p ON op.product_id = p.product_id
        WHERE p.band_id = ? AND o.status != 'Cancelled'
        `, [bandId]);

            // Inventory analysis
            const [inventoryRows] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
            COUNT(*) as total_products,
            SUM(CASE WHEN i.quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
            SUM(CASE WHEN i.quantity > 0 AND i.quantity <= 10 THEN 1 ELSE 0 END) as low_stock,
            SUM(CASE WHEN i.quantity > 10 THEN 1 ELSE 0 END) as healthy_stock,
            AVG(i.quantity) as avg_stock_level
        FROM products p
        LEFT JOIN inventory i ON p.product_id = i.product_id
        WHERE p.band_id = ? AND p.is_deleted = 0
        `, [bandId]);

            // Sales trends by product category
            const [categoryRows] = await dbPool.execute<mysql.RowDataPacket[]>(`
        SELECT 
            p.category,
            SUM(op.quantity) as units_sold,
            SUM(op.quantity * p.price) as revenue,
            COUNT(DISTINCT p.product_id) as product_count
        FROM products p
        LEFT JOIN orders_products op ON p.product_id = op.product_id
        LEFT JOIN orders o ON op.order_id = o.order_id AND o.status != 'Cancelled'
        WHERE p.band_id = ? AND p.is_deleted = 0
        GROUP BY p.category
        ORDER BY revenue DESC
        `, [bandId]);

            return {
                revenueData: revenueRows,
                productPerformance: productRows,
                bookingAnalytics: bookingRows.reduce((acc: any, row: any) => {
                    acc[row.status] = {
                        count: row.count,
                        avg_price: parseFloat(row.avg_price) || 0,
                        earliest_booking: row.earliest_booking,
                        latest_booking: row.latest_booking
                    };
                    return acc;
                }, {}),
                customerInsights: customerRows[0] || {},
                inventoryAnalysis: inventoryRows[0] || {},
                salesTrends: categoryRows
            };

        } catch (error) {
            console.error("Error fetching analytics:", error);
            set.status = 500;
            return { error: "Internal Server Error while retrieving analytics" };
        }
    })

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
