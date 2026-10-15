/**
 * Manejo centralizado de errores del identity-service.
 *
 * Reglas de negocio:
 * - Todo error con significado de negocio se representa con `AppError`.
 * - `code` es un CONTRATO PÚBLICO (inglés, mayúsculas) y no cambia una vez publicado.
 * - `message` está en español porque lo recibe el usuario final.
 * - `isOperational = false` => fallo inesperado; NUNCA se expone su mensaje ni stack.
 * - Prohibido guardar secretos en `context`.
 */

import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "./logger.js";

export interface AppErrorOptions {
  readonly code: string;
  readonly statusCode: number;
  readonly cause?: unknown;
  readonly isOperational?: boolean;
  readonly context?: Readonly<Record<string, unknown>>;
}

export interface AppErrorResponse {
  readonly code: string;
  readonly message: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Readonly<Record<string, unknown>>;

  public constructor(message: string, options: AppErrorOptions) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.isOperational = options.isOperational ?? true;
    this.context = options.context;
  }

  public toJSON(): AppErrorResponse {
    return { code: this.code, message: this.message };
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** Envuelve handlers async para reenviar errores al middleware global. */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    code: "NOT_FOUND",
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Datos de entrada inválidos",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (isAppError(error)) {
    if (!error.isOperational) {
      logger.error({ err: error, context: error.context }, "Error no operativo");
    }
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  logger.error({ err: error }, "Error inesperado no controlado");
  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "Error interno del servidor",
  });
}
