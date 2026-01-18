import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { env } from "../env.js";

const importSchema = z.object({
  products: z.array(
    z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      dosage: z.string().optional(),
      volume: z.string().optional(),
      retailPrice: z.number(),
      wholesalePrice: z.number(),
      wholesaleMinQty: z.number().int().min(1).default(10),
      status: z.enum(["active", "soon", "archived"]).default("active"),
      imageUrl: z.string().url().optional(),
    }),
  ),
});

export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    if (request.routerPath?.startsWith("/admin")) {
      const token = request.headers["x-admin-token"];
      if (token !== env.ADMIN_TOKEN) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
    }
  });

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
