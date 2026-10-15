// Middleware de autenticación y autorización por rol.
// El access token viaja en la cabecera `Authorization: Bearer <token>`.

import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors.js";
import { verifyAccessToken } from "../../shared/jwt.js";

export type Role = "PLAYER" | "ADMIN";

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const BEARER_PREFIX = "Bearer ";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next(
      new AppError("Token de acceso requerido", {
        code: "MISSING_TOKEN",
        statusCode: 401,
      }),
    );
    return;
  }

  try {
    const payload = verifyAccessToken(header.slice(BEARER_PREFIX.length));
    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      role: payload.role as Role,
      email: payload.email,
    };
    next();
  } catch {
    next(
      new AppError("Token de acceso inválido o expirado", {
        code: "INVALID_TOKEN",
        statusCode: 401,
      }),
    );
  }
}

/** Devuelve el usuario autenticado o lanza 401 (para usar dentro de handlers). */
export function requireUser(req: Request): AuthUser {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new AppError("No autenticado", {
      code: "UNAUTHENTICATED",
      statusCode: 401,
    });
  }
  return user;
}

export function requireRole(
  ...roles: Role[]
): (req: Request, _res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      next(
        new AppError("No autenticado", {
          code: "UNAUTHENTICATED",
          statusCode: 401,
        }),
      );
      return;
    }

    if (!roles.includes(user.role)) {
      next(
        new AppError("Permisos insuficientes", {
          code: "FORBIDDEN",
          statusCode: 403,
        }),
      );
      return;
    }

    next();
  };
}
