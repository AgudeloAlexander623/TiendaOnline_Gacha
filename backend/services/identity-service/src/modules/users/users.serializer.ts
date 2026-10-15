// Serialización pública de un usuario: NUNCA incluye `passwordHash`.

import type { User } from "../../generated/prisma/client.js";

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export function serializeUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}
