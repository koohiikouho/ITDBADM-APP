import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

import { usersController } from "./controllers/users"; // Import the users controller
import { bandsController } from "./controllers/bands"; // Import the bands controller
import { productsController } from "./controllers/products"; // Import the products controller
import "./db"; // Initialize the database pool
import { cors } from "@elysiajs/cors";

import { authRoutes } from "./auth";
import { ordersController } from "./controllers/orders";
import { cartsController } from "./controllers/carts";
import { branchController } from "./controllers/branches";
import { bookingsController } from "./controllers/bookings";
import { likeController } from "./controllers/like";

// JWT Middleware Configuration

const app = new Elysia()
  .use(authRoutes)
  .use(cors())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
      exp: "1d",
    })
  )

  // Define a basic GET route at the root path "/"
  .get("/", () => {
    return {
      message: "Band N' Brand API is running!",
      status: "Online",
    };
  })

  // Controllers
  .use(usersController) // Use the users controller
  .use(bandsController) // Use the bands controller
  .use(productsController) // Use the products controller
  .use(ordersController) // Use the orders controller
  .use(cartsController)
  .use(branchController)
  .use(likeController)
  .use(bookingsController)

  .use(cors())

  // Start the server on port 3000
  .listen(3000);

console.log(
  `Elysia server is running at ${app.server?.hostname}:${app.server?.port}`
);
