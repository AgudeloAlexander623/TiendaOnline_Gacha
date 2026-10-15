// Utilidades de hash de contraseñas.
// Regla: nunca se almacena ni se registra la contraseña en claro.

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export function verifyPassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
