// src/controllers/bands.ts
import { Elysia, t } from "elysia";
import { dbPool } from "../db";
import mysql from "mysql2/promise";

export const bandsController = new Elysia({ prefix: "/bands" })

  // GET /bands
  .get(
    "/",
    async ({ set }) => {
      try {
        // SQL Query: Fetch essential details for all non-deleted bands
        const query = `
                SELECT 
                    b.band_id, 
                    b.name AS band_name, 
                    b.genre, 
                    b.description,
                    b.pfp_string,
                    br.branch_id,
                    COUNT(bm.member_name) AS member_count
                FROM bands b
                LEFT JOIN branches br ON b.branch_id = br.branch_id
                LEFT JOIN band_members bm ON b.band_id = bm.band_id
                WHERE b.is_deleted = 0
                GROUP BY b.band_id, b.name, b.genre, b.description, br.branch_name;
            `;

        const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

        if (rows.length === 0) {
          set.status = 200;
          return { message: "No bands registered yet." };
        }

        // Map the results to a clean array of band objects
        const bandList = rows.map((row) => ({
          id: row.band_id,
          name: row.band_name,
          genre: row.genre,
          img: row.pfp_string,
          description_short: row.description
            ? row.description.substring(0, 100) + "..."
            : null, // Truncate description for list view
          branch: row.branch_id,
          members: row.member_count,
        }));

        set.status = 200;
        return bandList;
      } catch (error) {
        console.error("Error fetching all bands:", error);
        set.status = 500;
        return { message: "Internal Server Error while retrieving band list." };
      }
    },
    {
      detail: {
        summary: "Get a list overview of all available bands",
      },
    }
  )

  // GET /bands/:id
  .get("/:id", async ({ params, set }) => {
    //getting the id from the params
    const bandId = params.id;

    if (isNaN(Number(bandId))) {
      set.status = 400;
      return { error: "Invalid band ID." };
    }

    try {
      const query = `CALL sp_get_band_details(${bandId});`;

      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

      if (rows.length === 0) {
        set.status = 200;
        return { message: "Band not found." };
      }

      const bandDetails = rows[0]; // First result set, first row

      return bandDetails; // Return the band details object
    } catch (error) {
      console.error("Error fetching band details:", error);
      set.status = 500;
      return {
        message: "Internal Server Error while retrieving band details.",
      };
    }
  })

  // GET /bands/schedule/:id
  .get("/schedule/:id", async ({ params, set }) => {
    //getting the id from the params
    const bandId = params.id;

    if (isNaN(Number(bandId))) {
      set.status = 400;
      return { error: "Invalid band ID." };
    }

    try {
      const query = `CALL sp_get_band_schedule(${bandId});`;

      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

      if (rows.length === 0) {
        set.status = 200;
        return { message: "No schedules found for this band." };
      }

      const bandSchedule = rows[0]; // First result set

      return bandSchedule; // Return the band schedule array
    } catch (error) {
      console.error("Error fetching band schedule:", error);
      set.status = 500;
      return {
        message: "Internal Server Error while retrieving band schedule.",
      };
    }
  })

  // GET /bands/products/:id
  // gets all products offered by a band
  .get("/products/:id", async ({ params, set }) => {
    //getting the id from the params
    const bandId = params.id;

    if (isNaN(Number(bandId))) {
      set.status = 400;
      return { error: "Invalid band ID." };
    }

    try {
      const query = `CALL sp_get_band_products(${bandId});`;

      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

      if (rows.length === 0) {
        set.status = 200;
        return { message: "No products found for this band." };
      }

      const bandProductsList = rows[0]; // First result set

      // Process each product to return only one image in the array
      const processedProducts = bandProductsList.map((product: any) => {
        // Handle different image formats to return only one image in array
        let singleImageUrl;

        // Use the 'image' field instead of 'img'
        if (product.image && product.image.url) {
          if (Array.isArray(product.image.url)) {
            // If it's an array, take the first image
            singleImageUrl = product.image.url[0];
          } else {
            // If it's already a single string, use it directly
            singleImageUrl = product.image.url;
          }
        } else {
          // Fallback if no image is available
          singleImageUrl = null;
        }

        // Return the product with processed image field (remove the duplicate img field)
        const { img, ...productWithoutImg } = product;
        return {
          ...productWithoutImg,
          image: {
            url: singleImageUrl ? [singleImageUrl] : [],
          },
        };
      });

      return processedProducts; // Return the processed band products array
    } catch (error) {
      console.error("Error fetching band products:", error);
      set.status = 500;
      return {
        message: "Internal Server Error while retrieving band products.",
      };
    }
  })

  .get("/products/:id/max10", async ({ params, set }) => {
    //getting the id from the params
    const bandId = params.id;

    if (isNaN(Number(bandId))) {
      set.status = 400;
      return { error: "Invalid band ID." };
    }

    try {
      const query = `CALL sp_get_band_products(${bandId});`;

      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query);

      if (rows.length === 0) {
        set.status = 200;
        return { message: "No products found for this band." };
      }

      const bandProductsList = rows[0]; // First result set

      // Process each product to return only one image in the array
      const processedProducts = bandProductsList.map((product: any) => {
        // Handle different image formats to return only one image in array
        let singleImageUrl;

        // Use the 'image' field instead of 'img'
        if (product.image && product.image.url) {
          if (Array.isArray(product.image.url)) {
            // If it's an array, take the first image
            singleImageUrl = product.image.url[0];
          } else {
            // If it's already a single string, use it directly
            singleImageUrl = product.image.url;
          }
        } else {
          // Fallback if no image is available
          singleImageUrl = null;
        }

        // Return the product with processed image field (remove the duplicate img field)
        const { img, ...productWithoutImg } = product;
        return {
          ...productWithoutImg,
          image: {
            url: singleImageUrl ? [singleImageUrl] : [],
          },
        };
      });

      // Return only the first 10 results
      return processedProducts.slice(0, 10);
    } catch (error) {
      console.error("Error fetching band products:", error);
      set.status = 500;
      return {
        message: "Internal Server Error while retrieving band products.",
      };
    }
  });
