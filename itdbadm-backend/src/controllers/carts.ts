import { Elysia, t } from "elysia";
import { dbPool } from "../db";
import mysql from "mysql2/promise";

import { jwt } from "@elysiajs/jwt";
import { FrankfurterService } from "../services/frankfurterService";

export const cartsController = new Elysia({ prefix: "/carts" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
      exp: "1d",
    })
  )

  //GET all products from a user's cart
  .get("/user/:currency", async ({ params, headers, set, jwt }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const userId = payload.id;

    try {
      const cartQuery = `SELECT * FROM carts WHERE user_id = ${userId};`;
      const [cartRows] = await dbPool.execute<mysql.RowDataPacket[]>(cartQuery);

      if (cartRows.length === 0) {
        set.status = 200;
        return { message: "No items in the cart found." };
      }

      const productIds = cartRows.map((row) => row.product_id);

      const productQuery = `
            SELECT product_id, name, price, description, category, band_id, image, is_deleted 
            FROM products 
            WHERE product_id IN (${productIds.join(",")})
        `;
      const [productRows] = await dbPool.execute<mysql.RowDataPacket[]>(
        productQuery
      );

      const productMap = new Map();
      productRows.forEach((product) => {
        productMap.set(product.product_id, product);
        product.price = FrankfurterService.convert(
          product.price,
          params.currency
        ).amount;
      });

      const userCartList = cartRows.map((cartItem) => {
        const product = productMap.get(cartItem.product_id);

        // Handle different image formats to return only one image in array
        let singleImageUrl;

        if (product?.image && product.image.url) {
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

        return {
          user_id: cartItem.user_id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          name: product?.name,
          price: product?.price,
          description: product?.description,
          category: product?.category,
          band_id: product?.band_id,
          image: {
            url: singleImageUrl ? [singleImageUrl] : [],
          },
          is_deleted: product?.is_deleted,
        };
      });

      set.status = 200;
      return userCartList;
    } catch (error) {
      console.error("Error fetching cart contents: ", error);
      set.status = 500;
      return { message: "Internal Server Error while retrieving user cart." };
    }
  })

  .post(
    "/add",
    async ({ body, headers, set, jwt }) => {
      const token = headers.authorization?.split(" ")[1];
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const userId = payload.id;
      const { product_id } = body;

      try {
        // First check if the product exists and is not deleted
        // Use LIMIT 1 to ensure only one row is returned
        const productCheckQuery =
          "SELECT product_id, is_deleted FROM products WHERE product_id = ? LIMIT 1";
        const [productRows] = await dbPool.execute<mysql.RowDataPacket[]>(
          productCheckQuery,
          [product_id]
        );

        if (productRows.length === 0) {
          set.status = 404;
          return { error: "Product not found" };
        }

        // shutting up undefined error
        if (productRows[0]?.is_deleted) {
          set.status = 400;
          return { error: "Product is no longer available" };
        }

        // Check if the item already exists in the cart
        const cartCheckQuery =
          "SELECT * FROM carts WHERE user_id = ? AND product_id = ? LIMIT 1";
        const [existingCartItems] = await dbPool.execute<mysql.RowDataPacket[]>(
          cartCheckQuery,
          [userId, product_id]
        );

        if (existingCartItems.length > 0) {
          // Item exists, increment quantity
          const updateQuery =
            "UPDATE carts SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?";
          const [updateResult] = await dbPool.execute(updateQuery, [
            userId,
            product_id,
          ]);

          // Get the updated quantity by querying again
          const [updatedCartItems] = await dbPool.execute<
            mysql.RowDataPacket[]
          >(
            "SELECT quantity FROM carts WHERE user_id = ? AND product_id = ? LIMIT 1",
            [userId, product_id]
          );

          set.status = 200;
          return {
            message: "Cart item quantity updated",
            action: "incremented",
            product_id,
            new_quantity: updatedCartItems[0]?.quantity, // shutting up undefined error
          };
        } else {
          // Item doesn't exist, insert new record
          const insertQuery =
            "INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)";
          await dbPool.execute(insertQuery, [userId, product_id, 1]);

          set.status = 201;
          return {
            message: "Item added to cart",
            action: "added",
            product_id,
            quantity: 1,
          };
        }
      } catch (error) {
        console.error("Error adding item to cart: ", error);
        set.status = 500;
        return { error: "Internal Server Error while adding item to cart" };
      }
    },
    {
      body: t.Object({
        product_id: t.Numeric(),
      }),
    }
  )
  .put(
    "/item",
    async ({ body, headers, set, jwt }) => {
      const token = headers.authorization?.split(" ")[1];
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const userId = payload.id;
      const { operation, product_id, new_quantity } = body;

      try {
        // First check if the cart item exists
        const cartCheckQuery =
          "SELECT * FROM carts WHERE user_id = ? AND product_id = ? LIMIT 1";
        const [existingCartItems] = await dbPool.execute<mysql.RowDataPacket[]>(
          cartCheckQuery,
          [userId, product_id]
        );

        if (existingCartItems.length === 0) {
          set.status = 404;
          return { error: "Cart item not found" };
        }

        if (operation === "change") {
          // Validate new_quantity
          if (new_quantity === undefined || new_quantity === null) {
            set.status = 400;
            return { error: "new_quantity is required for change operation" };
          }

          if (new_quantity < 0) {
            set.status = 400;
            return { error: "Quantity cannot be negative" };
          }

          if (new_quantity === 0) {
            // If quantity is set to 0, remove the item from cart
            const deleteQuery =
              "DELETE FROM carts WHERE user_id = ? AND product_id = ?";
            await dbPool.execute(deleteQuery, [userId, product_id]);

            set.status = 200;
            return {
              message: "Item removed from cart",
              action: "removed",
              product_id,
              previous_quantity: existingCartItems[0]?.quantity, // shutting up undefined error
            };
          } else {
            // Update to the new quantity
            const updateQuery =
              "UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?";
            const [updateResult] = await dbPool.execute(updateQuery, [
              new_quantity,
              userId,
              product_id,
            ]);

            set.status = 200;
            return {
              message: "Cart item quantity updated",
              action: "updated",
              product_id,
              previous_quantity: existingCartItems[0]?.quantity, // shutting up undefined error
              new_quantity: new_quantity,
            };
          }
        } else if (operation === "delete") {
          // Delete the item from cart
          const deleteQuery =
            "DELETE FROM carts WHERE user_id = ? AND product_id = ?";
          await dbPool.execute(deleteQuery, [userId, product_id]);

          set.status = 200;
          return {
            message: "Item removed from cart",
            action: "deleted",
            product_id,
            previous_quantity: existingCartItems[0]?.quantity, // shutting up undefined error
          };
        } else {
          set.status = 400;
          return { error: "Invalid operation. Use 'change' or 'delete'" };
        }
      } catch (error) {
        console.error("Error updating cart item: ", error);
        set.status = 500;
        return { error: "Internal Server Error while updating cart item" };
      }
    },
    {
      body: t.Object({
        operation: t.String(),
        product_id: t.Numeric(),
        new_quantity: t.Optional(t.Numeric()),
      }),
    }
  )

  .post(
    "/place-order",
    async ({ body, headers, set, jwt }) => {
      const token = headers.authorization?.split(" ")[1];
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const userId = payload.id;
      const {
        contact_information,
        first_name,
        last_name,
        address,
        city,
        country,
        postal_code,
      } = body;

      // Validate required fields
      if (
        !contact_information ||
        !first_name ||
        !last_name ||
        !address ||
        !city ||
        !country ||
        !postal_code
      ) {
        set.status = 400;
        return { error: "All shipping information fields are required" };
      }

      try {
        // Call the stored procedure
        const [result] = await dbPool.execute<any>(
            `CALL sp_place_order(?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                contact_information,
                first_name,
                last_name,
                address,
                city,
                country,
                postal_code
            ]
        );

        // The result from a CALL statement is an array of result sets.
        // The first element (result[0]) contains the rows returned by our SELECT statement at the end of the SP.
        const rows = result[0];
        
        if (!rows || rows.length === 0) {
            throw new Error("Failed to create order");
        }

        const orderData = rows[0];

        set.status = 201;
        return {
            message: "Order placed successfully",
            order_id: orderData.order_id,
            shipping_id: orderData.shipping_id,
            total_price: orderData.total_price
        };

    } catch (error: any) {
        console.error("Error placing order:", error);
        
        // Handle the specific "Cart is empty" error we signaled in SQL
        if (error.sqlMessage === 'Cart is empty') {
            set.status = 400;
            return { error: "Cart is empty" };
        }

        set.status = 500;
        return {
            error: "Internal Server Error while placing order",
        };    
    }
      
      },
      {
        body: t.Object({
          contact_information: t.String(),
          first_name: t.String(),
          last_name: t.String(),
          address: t.String(),
          city: t.String(),
          country: t.String(),
          postal_code: t.String(),
        }),
      }
  );
