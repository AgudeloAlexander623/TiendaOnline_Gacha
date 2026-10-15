// payments-service · validación de variables de entorno

import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z
    .string()
    .optional()
    .default("3004")
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "PORT debe ser un número entero positivo",
    }),
  SERVICE_NAME: z.string().min(1).default("payments-service"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatoria"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET debe tener al menos 16 caracteres"),
  CORS_ORIGIN: z.string().min(1).default("*"),
  RATE_LIMIT_MAX: z
    .string()
    .optional()
    .default("200")
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "RATE_LIMIT_MAX debe ser un número entero positivo",
    }),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  // Las recargas son simuladas: no se procesa dinero real.
  PAYMENT_PROVIDER: z.enum(["mock", "stripe", "mercadopago"]).default("mock"),
  CURRENCY: z.string().trim().length(3).default("COP"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const errors = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Error de validación de variables de entorno:\n${errors}`);
}

export type Config = z.infer<typeof envSchema>;
export const config: Config = parsedEnv.data;
