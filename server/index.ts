import { Elysia } from "elysia";
import { charactersRoutes, conversationsRoutes } from "./routes";
import { chatRoutes } from "./routes/chat";

const app = new Elysia()
  .onRequest(({ request }) => {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }
  })
  .onAfterResponse(({ request, response }) => {
    if (response instanceof Response) {
      response.headers.set("Access-Control-Allow-Origin", "*");
    }
  })
  .group("/api", (app) =>
    app.use(charactersRoutes).use(conversationsRoutes).use(chatRoutes)
  )
  .get("/health", () => ({ status: "ok" }))
  .listen(3000);

console.log(`🦊 Server running at http://localhost:${app.server?.port}`);
