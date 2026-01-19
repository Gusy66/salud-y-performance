import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { env } from "./env.js";
import { productsRoutes } from "./routes/products.js";
import { checkoutRoutes } from "./routes/checkout.js";
import { adminRoutes } from "./routes/admin.js";

export async function buildServer() {
  const app = Fastify({
    logger: true,
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return cb(null, true);
      
      // Allow localhost for development
      if (origin.includes("localhost")) return cb(null, true);
      
      // Allow any vercel.app domain
      if (origin.endsWith(".vercel.app")) return cb(null, true);
      
      // Allow configured origins
      const allowedOrigins = env.FRONTEND_ORIGIN.split(",").map((o) => o.trim());
      if (allowedOrigins.includes(origin)) return cb(null, true);
      
      // Deny others
      cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 50,
    timeWindow: "1 minute",
  });

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(productsRoutes, { prefix: "/products" });
  await app.register(checkoutRoutes, { prefix: "/checkout" });
  await app.register(adminRoutes, { prefix: "/admin" });

  return app;
}
