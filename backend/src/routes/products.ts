import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function productsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const products = await prisma.product.findMany({
      where: { status: { in: ["active", "soon"] } },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return products.map((p) => {
      const retailPrice = Number(p.retailPrice);
      const wholesalePrice = Number(p.wholesalePrice);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        category: p.category,
        dosage: p.dosage,
        volume: p.volume,
        retailPrice,
        wholesalePrice,
        wholesaleMinQty: p.wholesaleMinQty,
        status: p.status,
        imageUrl: p.imageUrl,
      };
    });
  });
}
