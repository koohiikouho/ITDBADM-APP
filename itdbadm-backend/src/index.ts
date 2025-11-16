import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

import { usersController } from "./controllers/users"; // Import the users controller
import { bandsController } from "./controllers/bands"; // Import the bands controller
import { productsController } from "./controllers/products"; // Import the products controller
import "./db"; // Initialize the database pool
import { cors } from "@elysiajs/cors";

import { authRoutes } from "./auth";


// JWT Middleware Configuration


const app = new Elysia()
.use(authRoutes)


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
  .use(cors())

  // Start the server on port 3000
  .listen(3000);
  

console.log(
  `Elysia server is running at ${app.server?.hostname}:${app.server?.port}`
);
