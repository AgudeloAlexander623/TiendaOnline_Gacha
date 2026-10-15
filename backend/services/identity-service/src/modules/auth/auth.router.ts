// Rutas del módulo de autenticación.

import { Router, type Request } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireUser } from "./auth.middleware.js";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas.js";
import { login, logout, refresh, register, type ClientMeta } from "./auth.service.js";
import { getProfile } from "../users/users.service.js";

export const authRouter = Router();

function clientMeta(req: Request): ClientMeta {
  return {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  };
}

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const result = await register(input, clientMeta(req));
    res.status(201).json(result);
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    res.json(await login(input, clientMeta(req)));
  }),
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    res.json(await refresh(refreshToken, clientMeta(req)));
  }),
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    res.json(await logout(refreshToken));
  }),
);

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = requireUser(req);
    res.json(await getProfile(user.id));
  }),
);
