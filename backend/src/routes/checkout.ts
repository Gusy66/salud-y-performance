import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendOrderEmail } from "../services/emailService.js";

const checkoutSchema = z.object({
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
});

export async function checkoutRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const parsed = checkoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const { customerName, email, phone, address, items } = parsed.data;
    const productIds = items.map((i) => i.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: { in: ["active", "soon"] } },
    });

    if (products.length !== productIds.length) {
      return reply.status(400).send({ error: "Produto inválido ou indisponível." });
    }

    const enrichedItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const useWholesale = item.quantity >= product.wholesaleMinQty;
      const unitPrice = Number(
        (useWholesale ? product.wholesalePrice : product.retailPrice).toFixed(2),
      );

      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPrice,
        unitPriceWholesale: Number(product.wholesalePrice),
      };
    });

    const subtotal = enrichedItems.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0,
    );
    const total = subtotal; // frete e taxas podem ser adicionados depois

    const order = await prisma.order.create({
      data: {
        customerName,
        email,
        phone,
        address,
        items: enrichedItems,
        subtotal,
        total,
        status: "pending_email",
      },
    });

    let emailSent = false;
    try {
      await sendOrderEmail({
        customerName,
        email,
        phone,
        address,
        items: enrichedItems,
        total,
      });

      emailSent = true;
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "emailed",
          emailSentAt: new Date(),
        },
      });
    } catch (err) {
      // Não derrubar o checkout se SMTP/API falhar (Railway pode bloquear SMTP)
      request.log.error({ err, orderId: order.id }, "Failed to send order email");
    }

    return { orderId: order.id, total, emailSent };
  });
}
