// Lógica de negocio de productos del catálogo.

import type {
  Category,
  InventoryItem,
  Product,
  ProductImage,
} from "../../generated/prisma/client.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "./products.schemas.js";

const RELATIONS = {
  category: true,
  images: { orderBy: { position: "asc" } },
  inventory: true,
} as const;

type ProductWithRelations = Product & {
  category: Category | null;
  images: ProductImage[];
  inventory: InventoryItem | null;
};

export interface SerializedProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  isActive: boolean;
  category: Category | null;
  images: ProductImage[];
  availableStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeProduct(product: ProductWithRelations): SerializedProduct {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    currency: product.currency,
    isActive: product.isActive,
    category: product.category,
    images: product.images,
    availableStock: product.inventory
      ? product.inventory.stock - product.inventory.reserved
      : 0,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function listProducts(query: ListProductsQuery): Promise<{
  data: SerializedProduct[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}> {
  const { page, pageSize, categoryId, search, includeInactive } = query;

  const where = {
    ...(includeInactive ? {} : { isActive: true }),
    ...(categoryId ? { categoryId } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: RELATIONS,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    data: products.map(serializeProduct),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getProductById(id: string): Promise<SerializedProduct> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: RELATIONS,
  });
  if (!product) {
    throw new AppError("Producto no encontrado", {
      code: "PRODUCT_NOT_FOUND",
      statusCode: 404,
    });
  }
  return serializeProduct(product);
}

export async function getProductBySlug(slug: string): Promise<SerializedProduct> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: RELATIONS,
  });
  if (!product) {
    throw new AppError("Producto no encontrado", {
      code: "PRODUCT_NOT_FOUND",
      statusCode: 404,
    });
  }
  return serializeProduct(product);
}

export async function createProduct(
  input: CreateProductInput,
): Promise<SerializedProduct> {
  const clash = await prisma.product.findFirst({
    where: { OR: [{ sku: input.sku }, { slug: input.slug }] },
  });
  if (clash) {
    throw new AppError("Ya existe un producto con ese SKU o slug", {
      code: "PRODUCT_ALREADY_EXISTS",
      statusCode: 409,
    });
  }

  const product = await prisma.product.create({
    data: {
      sku: input.sku,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      price: input.price,
      currency: input.currency,
      categoryId: input.categoryId ?? null,
      images: {
        create: input.images.map((url, index) => ({ url, position: index })),
      },
      inventory: { create: { stock: input.stock } },
    },
    include: RELATIONS,
  });

  return serializeProduct(product);
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<SerializedProduct> {
  await getProductById(id);
  const product = await prisma.product.update({
    where: { id },
    data: {
      sku: input.sku,
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: input.price,
      currency: input.currency,
      categoryId: input.categoryId,
    },
    include: RELATIONS,
  });
  return serializeProduct(product);
}

/** Baja lógica: no se elimina el producto para conservar el historial de pedidos. */
export async function deactivateProduct(id: string): Promise<SerializedProduct> {
  await getProductById(id);
  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: RELATIONS,
  });
  return serializeProduct(product);
}
