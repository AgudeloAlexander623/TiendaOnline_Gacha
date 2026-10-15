// Lógica de negocio de autenticación: registro, login, refresh y logout.
//
// Reglas de negocio:
// - Las contraseñas se almacenan con hash (nunca en claro).
// - Cada sesión guarda SOLO el hash del refresh token y puede revocarse.
// - En el refresh se rota el token: la sesión anterior se revoca.
// - El servidor es la fuente de verdad: el cliente no decide roles ni sesiones.

import { createHash, randomUUID } from "node:crypto";
import type { User } from "../../generated/prisma/client.js";
import { config } from "../../config/config.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import { hashPassword, verifyPassword } from "../../shared/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../shared/jwt.js";
import { serializeUser, type PublicUser } from "../users/users.serializer.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";

export interface ClientMeta {
  userAgent?: string;
  ip?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export interface AuthResult {
  user: PublicUser;
  tokens: TokenPair;
}

const DURATION_UNITS: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function durationToMs(value: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d)$/.exec(value.trim());
  if (!match) {
    throw new AppError("Formato de duración inválido", {
      code: "INVALID_DURATION",
      statusCode: 500,
      isOperational: false,
    });
  }
  const amount = Number(match[1]);
  const unit = match[2] ?? "ms";
  return amount * (DURATION_UNITS[unit] ?? 1);
}

async function issueTokenPair(user: User, meta: ClientMeta): Promise<TokenPair> {
  const sessionId = randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, sid: sessionId });
  const expiresAt = new Date(
    Date.now() + durationToMs(config.JWT_REFRESH_EXPIRES_IN),
  );

  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt,
      userAgent: meta.userAgent ?? null,
      ipAddress: meta.ip ?? null,
    },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });

  return {
    accessToken,
    refreshToken,
    accessExpiresIn: config.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN,
  };
}

export async function register(
  input: RegisterInput,
  meta: ClientMeta,
): Promise<AuthResult> {
  const email = input.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("El correo ya está registrado", {
      code: "EMAIL_ALREADY_EXISTS",
      statusCode: 409,
    });
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(input.password),
      displayName: input.displayName,
    },
  });

  return { user: serializeUser(user), tokens: await issueTokenPair(user, meta) };
}

export async function login(
  input: LoginInput,
  meta: ClientMeta,
): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AppError("Credenciales inválidas", {
      code: "INVALID_CREDENTIALS",
      statusCode: 401,
    });
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("La cuenta no está activa", {
      code: "ACCOUNT_NOT_ACTIVE",
      statusCode: 403,
    });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    user: serializeUser(updated),
    tokens: await issueTokenPair(updated, meta),
  };
}

export async function refresh(
  refreshToken: string,
  meta: ClientMeta,
): Promise<AuthResult> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Refresh token inválido o expirado", {
      code: "INVALID_REFRESH_TOKEN",
      statusCode: 401,
    });
  }

  const session = await prisma.session.findUnique({
    where: { id: payload.sid },
  });

  if (
    !session ||
    session.revokedAt !== null ||
    session.expiresAt.getTime() < Date.now() ||
    session.tokenHash !== sha256(refreshToken)
  ) {
    throw new AppError("Sesión inválida o expirada", {
      code: "INVALID_SESSION",
      statusCode: 401,
    });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== "ACTIVE") {
    throw new AppError("La cuenta no está disponible", {
      code: "ACCOUNT_NOT_ACTIVE",
      statusCode: 403,
    });
  }

  // Rotación: se revoca la sesión usada y se emite un par nuevo.
  await prisma.session.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  });

  return { user: serializeUser(user), tokens: await issueTokenPair(user, meta) };
}

export async function logout(refreshToken: string): Promise<{ success: true }> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await prisma.session.updateMany({
      where: { id: payload.sid, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Logout idempotente: un token inválido no es un error para el cliente.
  }
  return { success: true };
}
