// src/controllers/bands.ts
import { Elysia, t } from "elysia";
import { dbPool } from "../db"; // Assuming db.ts is now in the src/ directory
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
                    br.branch_name,
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
          branch: row.branch_name,
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
  );

// GET /bands/:bandId route here later.
