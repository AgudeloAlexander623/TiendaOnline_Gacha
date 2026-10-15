// Rutas del módulo de paquetes de monedas.

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireRole } from "../../shared/auth.js";
import {
  createPackageSchema,
  packageIdParamSchema,
  updatePackageSchema,
} from "./packages.schemas.js";
import {
  createPackage,
  deactivatePackage,
  listPackages,
  updatePackage,
} from "./packages.service.js";

export const packagesRouter = Router();

packagesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const onlyActive = req.query.includeInactive !== "true";
    res.json({ data: await listPackages(onlyActive) });
  }),
);

packagesRouter.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const input = createPackageSchema.parse(req.body);
    res.status(201).json(await createPackage(input));
  }),
);

packagesRouter.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { id } = packageIdParamSchema.parse(req.params);
    const input = updatePackageSchema.parse(req.body);
    res.json(await updatePackage(id, input));
  }),
);

packagesRouter.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { id } = packageIdParamSchema.parse(req.params);
    res.json(await deactivatePackage(id));
  }),
);
