// store-service · validación de variables de entorno

import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .optional()
    .default("3002")
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "PORT debe ser un número entero positivo",
    }),
  SERVICE_NAME: z.string().min(1).default("store-service"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatoria"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET debe tener al menos 16 caracteres"),
  // Secreto para tokens de servicio (comunicación entre microservicios).
  // Si no se define, se usa JWT_SECRET como respaldo en entornos locales.
  INTERNAL_JWT_SECRET: z
    .string()
    .min(16, "INTERNAL_JWT_SECRET debe tener al menos 16 caracteres")
    .optional(),
  // Caducidad de los tokens de usuario (formato ms: 15m, 30d). Sin valor, jsonwebtoken
  // firmaría tokens sin `exp`; por eso hay default y son obligatorias en el tipo.
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

type ParsedEnv = z.infer<typeof envSchema>;

/**
 * Configuración validada del servicio.
 *
 * `INTERNAL_JWT_SECRET` siempre está presente: se toma de la variable de
 * entorno homónima o, si no se definió, de `JWT_SECRET` (que ya fue validado
 * como obligatorio y con longitud mínima).
 */
export type Config = Omit<ParsedEnv, "INTERNAL_JWT_SECRET"> & {
  INTERNAL_JWT_SECRET: string;
};

export const config: Config = {
  ...parsedEnv.data,
  INTERNAL_JWT_SECRET: parsedEnv.data.INTERNAL_JWT_SECRET ?? parsedEnv.data.JWT_SECRET,
};
