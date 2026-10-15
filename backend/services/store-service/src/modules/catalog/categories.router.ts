// Rutas del módulo de categorías.

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireRole } from "../../shared/auth.js";
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from "./categories.schemas.js";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "./categories.service.js";

export const categoriesRouter = Router();

categoriesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({ data: await listCategories() });
  }),
);

categoriesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = categoryIdParamSchema.parse(req.params);
    res.json(await getCategory(id));
  }),
);

categoriesRouter.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const input = createCategorySchema.parse(req.body);
    res.status(201).json(await createCategory(input));
  }),
);

categoriesRouter.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { id } = categoryIdParamSchema.parse(req.params);
    const input = updateCategorySchema.parse(req.body);
    res.json(await updateCategory(id, input));
  }),
);

categoriesRouter.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { id } = categoryIdParamSchema.parse(req.params);
    await deleteCategory(id);
    res.status(204).send();
  }),
);
