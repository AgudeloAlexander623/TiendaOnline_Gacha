// Idempotencia persistida en BD para operaciones internas.
// Usa tabla idempotency_keys: busca/crea IN_PROGRESS, guarda respuesta, devuelve cacheado.

import type { NextFunction, Request, Response } from "express";
import { createHash } from "node:crypto";
import { AppError } from "./errors.js";
import { prisma } from "../db/prisma.js";

function computeHash(req: Request): string {
  const body = JSON.stringify(req.body ?? {});
  const raw = `${req.method}:${req.baseUrl}${req.path}:${body}`;
  return createHash("sha256").update(raw).digest("hex");
}

function cleanup(): void {
  const now = new Date();
  prisma.idempotencyKey.deleteMany({ where: { expiresAt: { lt: now } } }).catch(() => {});
}

/** Middleware de idempotencia para POST con persistencia en BD. */
export function withIdempotency(options: { required?: boolean; service?: string } = {}) {
  const service = options.service ?? "economy-service";
  const TTL_MS = 24 * 60 * 60 * 1000;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== "POST") {
      next();
      return;
    }
    const keyHeader = req.header("Idempotency-Key");
    const keyBody = (req.body as any)?.idempotencyKey;
    const key = (keyHeader || keyBody) as string | undefined;
    if (!key) {
      if (options.required) {
        next(new AppError("Idempotency-Key requerido", { code: "IDEMPOTENCY_KEY_REQUIRED", statusCode: 400 }));
        return;
      }
      next();
      return;
    }

    cleanup();
    const routeKey = `${req.baseUrl}${req.path}`;
    const hash = computeHash(req);
    const expiresAt = new Date(Date.now() + TTL_MS);

    try {
      const existing = await prisma.idempotencyKey.findUnique({
        where: { key_service_path: { key, service, path: routeKey } },
      });

      if (existing) {
        if (existing.requestHash !== hash) {
          next(new AppError("Clave de idempotencia con cuerpo distinto", { code: "IDEMPOTENCY_CONFLICT", statusCode: 409 }));
          return;
        }
        if (existing.status === "IN_PROGRESS") {
          next(new AppError("Solicitud en proceso", { code: "IDEMPOTENCY_IN_PROGRESS", statusCode: 409 }));
          return;
        }
        if (existing.status === "CACHED" && existing.statusCode && existing.responseBody !== null) {
          res.status(existing.statusCode).json(existing.responseBody);
          return;
        }
      }

      await prisma.idempotencyKey.upsert({
        where: { key_service_path: { key, service, path: routeKey } },
        create: {
          key,
          service,
          method: req.method,
          path: routeKey,
          requestHash: hash,
          status: "IN_PROGRESS",
          expiresAt,
        },
        update: {
          status: "IN_PROGRESS",
          requestHash: hash,
          expiresAt,
        },
      });

      const originalJson = res.json.bind(res);
      res.json = (body: unknown): Response => {
        prisma.idempotencyKey
          .update({
            where: { key_service_path: { key, service, path: routeKey } },
            data: {
              status: "CACHED",
              statusCode: res.statusCode,
              responseBody: body as any,
              expiresAt: new Date(Date.now() + TTL_MS),
            },
          })
          .catch(() => {});
        return originalJson(body);
      };

      next();
    } catch (err) {
      next(err);
    }
  };
}
