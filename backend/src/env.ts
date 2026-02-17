import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v ? v === "true" : undefined)),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string().email(),
  ORDER_EMAIL_TO: z.string().email(),
  FRONTEND_ORIGIN: z.string(), // Can be multiple URLs separated by comma
  ADMIN_TOKEN: z.string().min(8),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  PORT: z.string().optional(),
});

export const env = envSchema.parse(process.env);
