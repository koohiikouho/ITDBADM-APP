import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { dbPool } from "../db";
import mysql from "mysql2/promise";

export const bookingsController = new Elysia({ prefix: "/bookings" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
      exp: "1d",
    })
  )

  // User booking routes

  // Get all bookings by a user
  .get("/user", async ({ headers, set, jwt }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const userId = payload.id;

    try {
      const query = `SELECT b.name, bo.offer_id, bo.band_id, bo.booking_date, bo.description, bo.price, bo.status, bo.date_created FROM booking_offers bo JOIN bands b ON b.band_id=bo.band_id WHERE bo.user_id = ?`;

      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query, [
        userId,
      ]);

      if (rows.length === 0) {
        set.status = 200;
        return { message: "No bookings found for this user." };
      }

      set.status = 200;
      return rows;
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      set.status = 500;
      return {
        message: "Internal Server Error while retrieving user bookings.",
      };
    }
  })

  
  // Delete a booking made by the owner user
  .delete("/:offer_id", async ({ headers, set, jwt, params }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const userId = payload.id;
    const offerId = params.offer_id;

    if (isNaN(Number(offerId))) {
      set.status = 400;
      return { error: "Invalid offer ID." };
    }

    try {
      // First, verify that the booking offer belongs to the user
      const verifyQuery = `SELECT user_id FROM booking_offers WHERE offer_id = ?`;
      const [verifyRows] = await dbPool.execute<mysql.RowDataPacket[]>(
        verifyQuery,
        [offerId]
      );

      if (verifyRows.length === 0) {
        set.status = 404;
        return { error: "Booking offer not found." };
      }


      // shutting up undefined error
      if (verifyRows[0]?.user_id !== userId) {
        set.status = 403;
        return { error: "You can only delete your own booking offers." };
      }

      // Delete the booking offer
      const deleteQuery = `DELETE FROM booking_offers WHERE offer_id = ?`;
      const [result] = await dbPool.execute<mysql.OkPacket>(deleteQuery, [
        offerId,
      ]);

      if (result.affectedRows === 0) {
        set.status = 404;
        return { error: "Booking offer not found." };
      }

      set.status = 200;
      return { message: "Booking offer deleted successfully." };
    } catch (error) {
      console.error("Error deleting booking offer:", error);
      set.status = 500;
      return {
        message: "Internal Server Error while deleting booking offer.",
      };
    }
  })

  // Create a new booking offer 
  .post(
    "/",
    async ({ headers, set, jwt, body }) => {
      const token = headers.authorization?.split(" ")[1];
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const userId = payload.id;
      const { band_id, event_date, offer_amount, event_details } = body;

      // Validate required fields
      if (!band_id || !event_date || !offer_amount || !event_details) {
        set.status = 400;
        return {
          error:
            "All fields are required: band_id, event_date, offer_amount, event_details",
        };
      }

      if (isNaN(Number(band_id))) {
        set.status = 400;
        return { error: "Invalid band ID." };
      }

      if (isNaN(Number(offer_amount)) || Number(offer_amount) <= 0) {
        set.status = 400;
        return { error: "Invalid offer amount." };
      }

      // Convert string date to Date object and validate
      const eventDate = new Date(event_date);
      const today = new Date();

      // Reset time parts to compare only dates (not time)
      today.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);

      // Check if the date is invalid
      if (isNaN(eventDate.getTime())) {
        set.status = 400;
        return { error: "Invalid event date format." };
      }

      // Check if event date is today or in the past
      if (eventDate <= today) {
        set.status = 400;
        return { error: "Event date must be in the future (after today)." };
      }

      try {
        // Verify band exists
        const bandQuery = `SELECT band_id FROM bands WHERE band_id = ?`;
        const [bandRows] = await dbPool.execute<mysql.RowDataPacket[]>(
          bandQuery,
          [band_id]
        );

        if (bandRows.length === 0) {
          set.status = 404;
          return { error: "Band not found." };
        }

        // Insert new booking offer
        const insertQuery = `
        INSERT INTO booking_offers (user_id, band_id, booking_date, description, price, status, date_created)
        VALUES (?, ?, ?, ?, ?, 'pending', NOW())
      `;

        const [result] = await dbPool.execute<mysql.OkPacket>(insertQuery, [
          userId,
          band_id,
          event_date, // Use the original string, MySQL will handle the conversion
          event_details,
          offer_amount,
        ]);

        set.status = 201;
        return {
          message: "Booking offer created successfully.",
          offer_id: result.insertId,
        };
      } catch (error) {
        console.error("Error creating booking offer:", error);
        set.status = 500;
        return {
          message: "Internal Server Error while creating booking offer.",
        };
      }
    },
    {
      body: t.Object({
        band_id: t.Numeric(),
        event_date: t.String(),
        offer_amount: t.Numeric(),
        event_details: t.String(),
      }),
    }
  )

  // Band manager routes

  // GET /bookings/band - Get offers for the band managed by the user
  .get("/band", async ({ headers, set, jwt }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const userId = payload.id;

    try {
      // 1. Get the band_id managed by this user
      const [bandRows] = await dbPool.execute<mysql.RowDataPacket[]>(
        `SELECT band_id FROM bands WHERE manager_id = ?`,
        [userId]
      );

      if (bandRows.length === 0) {
        set.status = 404;
        return { message: "You do not manage any band." };
      }

      const bandId = bandRows[0]?.band_id;

      // 2. Get offers for this band
      const query = `
        SELECT 
          bo.offer_id, 
          bo.user_id, 
          u.username as user_name,
          bo.booking_date, 
          bo.description, 
          bo.price, 
          bo.status, 
          bo.date_created 
        FROM booking_offers bo
        JOIN users u ON bo.user_id = u.user_id
        WHERE bo.band_id = ?
        ORDER BY bo.date_created DESC
      `;

      const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(query, [
        bandId,
      ]);

      if (rows.length === 0) {
        set.status = 200;
        return []; 
      }

      return rows;
    } catch (error) {
      console.error("Error fetching band bookings:", error);
      set.status = 500;
      return {
        message: "Internal Server Error while retrieving band bookings.",
      };
    }
  })

  // POST /bookings/:id/accept - Accept an offer
  .post("/:id/accept", async ({ params, headers, set, jwt }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
        set.status = 401;
        return { error: "Unauthorized" };
    }

    const userId = payload.id;
    const offerId = params.id;

    try {
        // Verify the user manages the band linked to this offer
        const [authRows] = await dbPool.execute<mysql.RowDataPacket[]>(
            `SELECT b.manager_id 
             FROM booking_offers bo 
             JOIN bands b ON bo.band_id = b.band_id 
             WHERE bo.offer_id = ?`,
            [offerId]
        );

        if (authRows.length === 0 || authRows[0]?.manager_id !== userId) {
            set.status = 403;
            return { error: "You are not authorized to accept this offer." };
        }

        // Call Stored Procedure
        await dbPool.execute(`CALL sp_accept_offer(?)`, [offerId]);

        return { message: "Offer accepted successfully." };

    } catch (error) {
        console.error("Error accepting offer:", error);
        set.status = 500;
        return { message: "Internal Server Error." };
    }
  })

  // POST /bookings/:id/reject - Reject an offer
  .post("/:id/reject", async ({ params, headers, set, jwt }) => {
      const token = headers.authorization?.split(" ")[1];
      const payload = await jwt.verify(token);
  
      if (!payload) {
          set.status = 401;
          return { error: "Unauthorized" };
      }
  
      const userId = payload.id;
      const offerId = params.id;
  
      try {
          // Verify auth
          const [authRows] = await dbPool.execute<mysql.RowDataPacket[]>(
              `SELECT b.manager_id 
               FROM booking_offers bo 
               JOIN bands b ON bo.band_id = b.band_id 
               WHERE bo.offer_id = ?`,
              [offerId]
          );
  
          if (authRows.length === 0 || authRows[0]?.manager_id !== userId) {
              set.status = 403;
              return { error: "You are not authorized to reject this offer." };
          }
  
          // Call Stored Procedure
          await dbPool.execute(`CALL sp_reject_offer(?)`, [offerId]);
  
          return { message: "Offer rejected successfully." };
  
      } catch (error) {
          console.error("Error rejecting offer:", error);
          set.status = 500;
          return { message: "Internal Server Error." };
      }
  });
