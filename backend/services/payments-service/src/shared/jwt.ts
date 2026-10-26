// Firma y verificación de tokens JWT.
// Access/refresh para usuarios; tokens de servicio para comunicación entre microservicios.

import jwt, { type SignOptions } from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { config } from "../config/config.js";

export interface AccessTokenPayload {
  sub: string;
  role: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  sid: string;
}

export interface ServiceTokenPayload {
  iss: string;
  sub: string;
  aud: "internal";
  scope: string[];
  jti: string;
}

const INTERNAL_JWT_SECRET = process.env.INTERNAL_JWT_SECRET || config.JWT_SECRET;

const ALLOWED_SERVICE_ISSUERS = new Set([
  "identity-service",
  "economy-service",
  "store-service",
  "payments-service",
]);

/** Firma access token de usuario. */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
}

/** Firma refresh token de usuario. */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

/** Verifica access token de usuario. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.JWT_SECRET) as AccessTokenPayload;
}

/** Verifica refresh token de usuario. */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.JWT_SECRET) as RefreshTokenPayload;
}

/** Firma token de servicio para llamadas internas (TTL corto). */
export function signServiceToken(input: {
  issuer: string;
  subject: string;
  scope: string[];
  expiresIn?: string | number;
}): string {
  const payload: ServiceTokenPayload = {
    iss: input.issuer,
    sub: input.subject,
    aud: "internal",
    scope: input.scope,
    jti: randomUUID(),
  };
  return jwt.sign(payload, INTERNAL_JWT_SECRET, {
    expiresIn: (input.expiresIn ?? "5m") as SignOptions["expiresIn"],
  } as SignOptions);
}

/** Verifica token de servicio con validación de aud/iss. */
export function verifyServiceToken(token: string): ServiceTokenPayload {
  const payload = jwt.verify(token, INTERNAL_JWT_SECRET) as ServiceTokenPayload;
  if (payload.aud !== "internal") {
    throw new Error("invalid_service_audience");
  }
  if (!ALLOWED_SERVICE_ISSUERS.has(payload.iss)) {
    throw new Error("invalid_service_issuer");
  }
  return payload;
}

/** Valida scopes requeridos contra token de servicio. */
export function hasServiceScope(payload: ServiceTokenPayload, required: string[]): boolean {
  if (required.length === 0) {
    return true;
  }
  const scopes = new Set(payload.scope ?? []);
  return required.every((s) => scopes.has(s));
}
