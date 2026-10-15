// ============================================================
// identity-service · validación de variables de entorno
// ============================================================
// Reglas de negocio:
// - El servicio NO debe arrancar con configuración inválida.
// - `DATABASE_URL` y `JWT_SECRET` son obligatorias (sin ellas no hay seguridad).
// - Los secretos nunca se registran en logs.

import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z
    .string()
    .optional()
    .default("3001")
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "PORT debe ser un número entero positivo",
    }),

  SERVICE_NAME: z.string().min(1).default("identity-service"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatoria"),

  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET debe tener al menos 16 caracteres"),

  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default("30d"),

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
