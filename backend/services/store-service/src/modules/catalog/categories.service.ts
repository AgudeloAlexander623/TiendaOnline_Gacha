// Lógica de negocio de categorías.

import type { Category } from "../../generated/prisma/client.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./categories.schemas.js";

export async function listCategories(): Promise<Category[]> {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getCategory(id: string): Promise<Category> {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError("Categoría no encontrada", {
      code: "CATEGORY_NOT_FOUND",
      statusCode: 404,
    });
  }
  return category;
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const existing = await prisma.category.findUnique({
    where: { slug: input.slug },
  });
  if (existing) {
    throw new AppError("Ya existe una categoría con ese slug", {
      code: "CATEGORY_SLUG_TAKEN",
      statusCode: 409,
    });
  }

  return prisma.category.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
    },
  });
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  await getCategory(id);

  if (input.slug) {
    const existing = await prisma.category.findUnique({
      where: { slug: input.slug },
    });
    if (existing && existing.id !== id) {
      throw new AppError("Ya existe una categoría con ese slug", {
        code: "CATEGORY_SLUG_TAKEN",
        statusCode: 409,
      });
    }
  }

  return prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
    },
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await getCategory(id);
  await prisma.category.delete({ where: { id } });
}
