// REGLAS DE NEGOCIO:
// - Todas las variables críticas deben validarse al inicio para evitar que el servicio arranque con configuración inválida.
// - NODE_ENV debe estar acotado a los entornos conocidos: development | production | test.
// - PORT debe ser numérico, entero y positivo.
// - SERVICE_NAME debe ser explícito para trazabilidad entre microservicios.
// - PAYMENT_PROVIDER centraliza el proveedor activo: mock | stripe | mercadopago.
// - CURRENCY se define con formato ISO 4217 cuando aplica a operaciones monetarias.
// - FRONTEND_URL solo se carga si el servicio lo va a utilizar para redirecciones.
// - Las claves y secretos de proveedores solo son obligatorios en función del proveedor activo, pero por ahora se mantienen opcionales para permitir arranque con "mock".
// - Nunca se deben loguear claves o secretos. Solo se validan y se inyectan desde variables de entorno.

import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z
    .string()
    .optional()
    .default("3000")
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "PORT debe ser un número entero positivo",
    }),

  SERVICE_NAME: z.string().min(1).default("payments-service"),

  PAYMENT_PROVIDER: z
    .enum(["mock", "stripe", "mercadopago"])
    .default("mock"),

  CURRENCY: z.string().min(1).optional().default("COP"),

  FRONTEND_URL: z.string().url().optional(),

  STRIPE_SECRET_KEY: z.string().min(1).optional(),

  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  MERCADOPAGO_ACCESS_TOKEN: z.string().min(1).optional(),

  MERCADOPAGO_WEBHOOK_SECRET: z.string().min(1).optional(),
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
