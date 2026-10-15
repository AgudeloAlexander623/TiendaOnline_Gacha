import { describe, expect, it } from "vitest";
import { registerSchema } from "../src/modules/auth/auth.schemas.js";

describe("identity-service · registerSchema", () => {
  it("acepta datos válidos", () => {
    const result = registerSchema.safeParse({
      email: "persona@gearquest.dev",
      password: "Contrasena123",
      displayName: "Persona",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un correo inválido", () => {
    const result = registerSchema.safeParse({
      email: "no-es-un-correo",
      password: "Contrasena123",
      displayName: "Persona",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una contraseña demasiado corta", () => {
    const result = registerSchema.safeParse({
      email: "persona@gearquest.dev",
      password: "corta",
      displayName: "Persona",
    });
    expect(result.success).toBe(false);
  });
});
