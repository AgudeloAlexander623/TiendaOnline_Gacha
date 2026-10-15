// Validación del módulo de paquetes de monedas.

import { z } from "zod";

export const createPackageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9-]+$/, "El slug solo admite minúsculas, números y guiones"),
  coins: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  currency: z.string().trim().length(3).default("COP"),
});

export const updatePackageSchema = createPackageSchema.partial();

export const packageIdParamSchema = z.object({ id: z.uuid() });

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
