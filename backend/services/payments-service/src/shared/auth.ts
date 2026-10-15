// Autenticación basada en el access token JWT emitido por el identity-service.

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { AppError } from "./errors.js";

export type Role = "PLAYER" | "ADMIN";

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

interface AccessTokenPayload {
  sub: string;
  role: Role;
  email: string;
}

const BEARER_PREFIX = "Bearer ";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next(new AppError("Token de acceso requerido", { code: "MISSING_TOKEN", statusCode: 401 }));
    return;
  }

  try {
    const payload = jwt.verify(
      header.slice(BEARER_PREFIX.length),
      config.JWT_SECRET,
    ) as AccessTokenPayload;
    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };
    next();
  } catch {
    next(new AppError("Token de acceso inválido o expirado", { code: "INVALID_TOKEN", statusCode: 401 }));
  }
}

export function requireUser(req: Request): AuthUser {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new AppError("No autenticado", { code: "UNAUTHENTICATED", statusCode: 401 });
  }
  return user;
}

export function requireRole(
  ...roles: Role[]
): (req: Request, _res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      next(new AppError("No autenticado", { code: "UNAUTHENTICATED", statusCode: 401 }));
      return;
    }
    if (!roles.includes(user.role)) {
      next(new AppError("Permisos insuficientes", { code: "FORBIDDEN", statusCode: 403 }));
      return;
    }
    next();
  };
}
