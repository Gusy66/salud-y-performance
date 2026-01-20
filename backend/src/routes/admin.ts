import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { env } from "../env.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  dosage: z.string().optional(),
  volume: z.string().optional(),
  retailPrice: z.number().positive(),
  wholesalePrice: z.number().positive(),
  wholesaleMinQty: z.number().int().min(1).default(10),
  status: z.enum(["active", "soon", "archived"]).default("active"),
  imageUrl: z.string().optional(),
});

const importSchema = z.object({
  products: z.array(productSchema),
});

// Helper to verify admin token
function verifyToken(token: string | string[] | undefined): boolean {
  return token === env.ADMIN_TOKEN;
}

export async function adminRoutes(app: FastifyInstance) {
  // Login route - no auth required
  app.post("/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid credentials format" });
    }

    const { email, password } = parsed.data;

    if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
      return { 
        success: true, 
        token: env.ADMIN_TOKEN,
        email: env.ADMIN_EMAIL 
      };
    }

    return reply.status(401).send({ error: "Invalid email or password" });
  });

  // Auth middleware for protected routes
  app.addHook("preHandler", async (request, reply) => {
    // Skip auth for login route
    if (request.url === "/admin/login") return;

    const token = request.headers["x-admin-token"];
    if (!verifyToken(token)) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
  });

  // Get all products (including archived)
  app.get("/products", async () => {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return products;
  });

  // Get single product
  app.get("/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return reply.status(404).send({ error: "Product not found" });
    }

    return product;
  });

  // Create product
  app.post("/products", async (request, reply) => {
    const parsed = productSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    // Check if slug already exists
    const existing = await prisma.product.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return reply.status(400).send({ error: "Slug already exists" });
    }

    const product = await prisma.product.create({
      data: parsed.data,
    });

    return reply.status(201).send(product);
  });

  // Update product
  app.put("/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = productSchema.partial().safeParse(request.body);
    
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return reply.status(404).send({ error: "Product not found" });
    }

    // If slug is being changed, check it doesn't conflict
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: parsed.data.slug },
      });
      if (slugExists) {
        return reply.status(400).send({ error: "Slug already exists" });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });

    return product;
  });

  // Delete product
  app.delete("/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return reply.status(404).send({ error: "Product not found" });
    }

    await prisma.product.delete({
      where: { id },
    });

    return { success: true };
  });

  // Bulk import (keep existing functionality)
  app.post("/import", async (request, reply) => {
    const parsed = importSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const ops = parsed.data.products.map((p) =>
      prisma.product.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          description: p.description,
          category: p.category,
          dosage: p.dosage,
          volume: p.volume,
          retailPrice: p.retailPrice,
          wholesalePrice: p.wholesalePrice,
          wholesaleMinQty: p.wholesaleMinQty,
          status: p.status,
          imageUrl: p.imageUrl,
        },
        create: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          category: p.category,
          dosage: p.dosage,
          volume: p.volume,
          retailPrice: p.retailPrice,
          wholesalePrice: p.wholesalePrice,
          wholesaleMinQty: p.wholesaleMinQty,
          status: p.status,
          imageUrl: p.imageUrl,
        },
      }),
    );

    await prisma.$transaction(ops);
    return { imported: parsed.data.products.length };
  });
}
