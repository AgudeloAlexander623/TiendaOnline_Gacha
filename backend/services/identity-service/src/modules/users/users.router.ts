// Rutas del módulo de usuarios (requieren autenticación).
// - El propio usuario gestiona su perfil (`/me`).
// - La administración (listar, ver, cambiar estado) exige rol ADMIN.

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireRole, requireUser } from "../auth/auth.middleware.js";
import {
  listUsersQuerySchema,
  updateProfileSchema,
  updateStatusSchema,
  userIdParamSchema,
} from "./users.schemas.js";
import {
  getProfile,
  getUserById,
  listUsers,
  setStatus,
  updateProfile,
} from "./users.service.js";

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = requireUser(req);
    res.json(await getProfile(user.id));
  }),
);

usersRouter.patch(
  "/me",
  asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const input = updateProfileSchema.parse(req.body);
    res.json(await updateProfile(user.id, input));
  }),
);

usersRouter.get(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const query = listUsersQuerySchema.parse(req.query);
    res.json(await listUsers(query));
  }),
);

usersRouter.get(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { id } = userIdParamSchema.parse(req.params);
    res.json(await getUserById(id));
  }),
);

usersRouter.patch(
  "/:id/status",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { id } = userIdParamSchema.parse(req.params);
    const input = updateStatusSchema.parse(req.body);
    res.json(await setStatus(id, input));
  }),
);
