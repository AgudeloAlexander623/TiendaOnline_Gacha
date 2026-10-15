// Esquemas de validación del módulo de autenticación.

import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Correo inválido").max(255),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128),
  displayName: z.string().trim().min(2).max(80),
});

export const loginSchema = z.object({
  email: z.email("Correo inválido").max(255),
  password: z.string().min(1).max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
