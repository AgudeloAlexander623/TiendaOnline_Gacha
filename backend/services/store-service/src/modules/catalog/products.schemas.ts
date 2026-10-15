// Validación del módulo de productos.

import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().trim().min(2).max(60),
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9-]+$/, "El slug solo admite minúsculas, números y guiones"),
  description: z.string().trim().max(2000).optional(),
  price: z.coerce.number().positive("El precio debe ser mayor que cero"),
  currency: z.string().trim().length(3).default("COP"),
  categoryId: z.uuid().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  images: z.array(z.string().url()).max(10).default([]),
});

export const updateProductSchema = createProductSchema
  .omit({ stock: true, images: true })
  .partial();

export const productIdParamSchema = z.object({ id: z.uuid() });
export const productSlugParamSchema = z.object({ slug: z.string().min(2) });

export const listProductsQuerySchema = z.object({
  categoryId: z.uuid().optional(),
  search: z.string().trim().min(1).optional(),
  includeInactive: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
