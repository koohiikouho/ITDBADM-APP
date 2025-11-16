import { Elysia } from 'elysia';

// Create a new Elysia application instance
const app = new Elysia()
    // Define a basic GET route at the root path "/"
    .get('/', () => {
        return {
            message: "Band N' Brand API is running!",
            status: "Online"
        };
    })
    // Start the server on port 3000
    .listen(3000);

// Log the server status to the console
console.log(
    `🦊 Elysia server is running at ${app.server?.hostname}:${app.server?.port}`
);