// Idempotencia en memoria para operaciones monetarias internas/POST críticas.
// No usa base de datos; se limpia por TTL.

import type { NextFunction, Request, Response } from "express";
import { createHash } from "node:crypto";
import { AppError } from "./errors.js";

type IdemStatus = "IN_PROGRESS" | "CACHED";

interface IdemEntry {
  status: IdemStatus;
  requestHash: string;
  statusCode?: number;
  body?: unknown;
  expiresAt: number;
}

const store = new Map<string, IdemEntry>();
const TTL_MS = 24 * 60 * 60 * 1000;

function cleanup(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
}

/** Genera clave de idempotencia por ruta+body. */
function computeHash(req: Request): string {
  const body = JSON.stringify(req.body ?? {});
  const raw = `${req.method}:${req.baseUrl}${req.path}:${body}`;
  return createHash("sha256").update(raw).digest("hex");
}

/** Middleware de idempotencia para POST. Usa header Idempotency-Key. */
export function withIdempotency(options: { required?: boolean } = {}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method !== "POST") {
      next();
      return;
    }
    const key = (req.header("Idempotency-Key") || (req.body as any)?.idempotencyKey) as string | undefined;
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
    const storeKey = `${routeKey}:${key}`;
    const hash = computeHash(req);
    const existing = store.get(storeKey);

    if (existing) {
      if (existing.requestHash !== hash) {
        next(new AppError("Clave de idempotencia con cuerpo distinto", { code: "IDEMPOTENCY_CONFLICT", statusCode: 409 }));
        return;
      }
      if (existing.status === "IN_PROGRESS") {
        next(new AppError("Solicitud en proceso", { code: "IDEMPOTENCY_IN_PROGRESS", statusCode: 409 }));
        return;
      }
      if (existing.status === "CACHED" && existing.statusCode && existing.body !== undefined) {
        res.status(existing.statusCode).json(existing.body);
        return;
      }
    }

    store.set(storeKey, { status: "IN_PROGRESS", requestHash: hash, expiresAt: Date.now() + TTL_MS });

    const originalJson = res.json.bind(res);
    res.json = (body: unknown): Response => {
      const entry = store.get(storeKey);
      if (entry && entry.status === "IN_PROGRESS") {
        store.set(storeKey, {
          status: "CACHED",
          requestHash: hash,
          statusCode: res.statusCode,
          body,
          expiresAt: Date.now() + TTL_MS,
        });
      }
      return originalJson(body);
    };

    next();
  };
}
