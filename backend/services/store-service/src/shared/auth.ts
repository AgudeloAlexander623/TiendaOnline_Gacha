// Autenticación de usuario y autenticación servicio-a-servicio.

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { AppError } from "./errors.js";
import { hasServiceScope, verifyServiceToken } from "./jwt.js";

export type Role = "PLAYER" | "ADMIN";

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  service?: { iss: string; sub: string; scope: string[] };
}

interface AccessTokenPayload {
  sub: string;
  role: Role;
  email: string;
}

const BEARER_PREFIX = "Bearer ";

/** Autentica token de usuario emitido por identity-service. */
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

/** Autentica token de servicio para rutas internas. */
export function authenticateService(requiredScopes: string[] = []) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith(BEARER_PREFIX)) {
      next(new AppError("Token de servicio requerido", { code: "MISSING_TOKEN", statusCode: 401 }));
      return;
    }
    try {
      const payload = verifyServiceToken(header.slice(BEARER_PREFIX.length));
      if (!hasServiceScope(payload, requiredScopes)) {
        next(new AppError("Permisos insuficientes", { code: "FORBIDDEN", statusCode: 403 }));
        return;
      }
      (req as AuthenticatedRequest).service = {
        iss: payload.iss,
        sub: payload.sub,
        scope: payload.scope,
      };
      next();
    } catch {
      next(new AppError("Token de servicio inválido o expirado", { code: "INVALID_TOKEN", statusCode: 401 }));
    }
  };
}

/** Valida presencia de usuario autenticado. */
export function requireUser(req: Request): AuthUser {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new AppError("No autenticado", { code: "UNAUTHENTICATED", statusCode: 401 });
  }
  return user;
}

/** Valida roles para rutas protegidas. */
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
