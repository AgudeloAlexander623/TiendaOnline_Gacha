// Esquemas de validación del módulo de usuarios.

import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const userIdParamSchema = z.object({
  id: z.uuid("El id debe ser un UUID válido"),
});

export const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING"]),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
