import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import {
  signAccessToken,
  signRefreshToken,
  signServiceToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyServiceToken,
} from "../src/shared/jwt.js";

interface DecodedToken {
  sub: string;
  iat: number;
  exp?: number;
  aud?: string;
  iss?: string;
}

/** Decodifica sin verificar: sirve para inspeccionar los claims emitidos. */
function decode(token: string): DecodedToken {
  const payload = jwt.decode(token);
  if (!payload || typeof payload === "string") {
    throw new Error("Token no decodificable");
  }
  return payload as DecodedToken;
}

describe("store-service · jwt de usuario", () => {
  const access = { sub: "u-1", role: "CLIENT", email: "cliente@gearquest.test" };

  it("el access token incluye exp y caduca en el futuro", () => {
    const { exp, iat } = decode(signAccessToken(access));

    expect(exp).toBeTypeOf("number");
    expect(exp as number).toBeGreaterThan(iat);
  });

  it("el refresh token incluye exp y vive más que el access token", () => {
    const accessExp = decode(signAccessToken(access)).exp as number;
    const refresh = decode(signRefreshToken({ sub: "u-1", sid: "s-1" }));

    expect(refresh.exp).toBeTypeOf("number");
    expect(refresh.exp as number).toBeGreaterThan(accessExp);
  });

  it("verifica el token y devuelve el payload original", () => {
    expect(verifyAccessToken(signAccessToken(access))).toMatchObject(access);
    expect(verifyRefreshToken(signRefreshToken({ sub: "u-1", sid: "s-1" }))).toMatchObject({
      sub: "u-1",
      sid: "s-1",
    });
  });

  it("rechaza un token firmado con otro secreto", () => {
    const ajeno = jwt.sign(access, "otro-secreto-de-pruebas-suficientemente-largo");

    expect(() => verifyAccessToken(ajeno)).toThrow();
  });
});

describe("store-service · jwt de servicio", () => {
  it("emite un token interno con exp y aud internal", () => {
    const token = signServiceToken({
      issuer: "store-service",
      subject: "economy-service",
      scope: ["wallet:debit"],
    });
    const decoded = decode(token);

    expect(decoded.aud).toBe("internal");
    expect(decoded.exp).toBeTypeOf("number");

    const verified = verifyServiceToken(token);
    expect(verified.scope).toEqual(["wallet:debit"]);
    expect(verified.iss).toBe("store-service");
  });

  it("rechaza un emisor no autorizado", () => {
    const token = signServiceToken({ issuer: "servicio-desconocido", subject: "x", scope: [] });

    expect(() => verifyServiceToken(token)).toThrow("invalid_service_issuer");
  });
});
