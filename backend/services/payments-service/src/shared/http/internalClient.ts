// Cliente HTTP interno para llamadas servicio-a-servicio.
// Usa token de servicio + Idempotency-Key. Mapea errores al formato del proyecto.

import { signServiceToken } from "../jwt.js";

export interface InternalCallOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  body?: unknown;
  issuer: string;
  subject: string;
  scope: string[];
  idempotencyKey?: string;
  timeoutMs?: number;
}

export interface InternalError {
  code: string;
  message: string;
  status: number;
}

function isInternalError(e: unknown): e is InternalError {
  return typeof e === "object" && e !== null && "code" in e && "status" in e;
}

export async function callInternal<T>(opts: InternalCallOptions): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 5000);

  const token = signServiceToken({
    issuer: opts.issuer,
    subject: opts.subject,
    scope: opts.scope,
    expiresIn: "5m",
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  if (opts.idempotencyKey) {
    headers["Idempotency-Key"] = opts.idempotencyKey;
  }

  try {
    const res = await fetch(opts.url, {
      method: opts.method,
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!res.ok) {
      const err = data as any;
      const error: InternalError = {
        code: err?.code || "INTERNAL_CALL_FAILED",
        message: err?.message || "Error en llamada interna",
        status: res.status,
      };
      throw error;
    }

    return data as T;
  } catch (e) {
    if (isInternalError(e)) {
      throw e;
    }
    const error: InternalError = {
      code: "INTERNAL_CALL_ERROR",
      message: e instanceof Error ? e.message : "Error desconocido",
      status: 0,
    };
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
