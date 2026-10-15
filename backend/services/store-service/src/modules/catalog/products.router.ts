// Rutas del módulo de productos.

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireRole } from "../../shared/auth.js";
import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
  productSlugParamSchema,
  updateProductSchema,
} from "./products.schemas.js";
import {
  createProduct,
  deactivateProduct,
  getProductById,
  getProductBySlug,
  listProducts,
  updateProduct,
} from "./products.service.js";

export const productsRouter = Router();

productsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = listProductsQuerySchema.parse(req.query);
    res.json(await listProducts(query));
  }),
);

productsRouter.get(
  "/slug/:slug",
  asyncHandler(async (req, res) => {
    const { slug } = productSlugParamSchema.parse(req.params);
    res.json(await getProductBySlug(slug));
  }),
);

productsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = productIdParamSchema.parse(req.params);
    res.json(await getProductById(id));
  }),
);

productsRouter.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const input = createProductSchema.parse(req.body);
    res.status(201).json(await createProduct(input));
  }),
);

productsRouter.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { id } = productIdParamSchema.parse(req.params);
    const input = updateProductSchema.parse(req.body);
    res.json(await updateProduct(id, input));
  }),
);

productsRouter.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { id } = productIdParamSchema.parse(req.params);
    res.json(await deactivateProduct(id));
  }),
);
