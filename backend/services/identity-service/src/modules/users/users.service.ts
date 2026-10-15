// Lógica de negocio del módulo de usuarios.
// El acceso a datos siempre se filtra por permisos en la capa de rutas.

import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import { serializeUser, type PublicUser } from "./users.serializer.js";
import type {
  ListUsersQuery,
  UpdateProfileInput,
  UpdateStatusInput,
} from "./users.schemas.js";

export interface PaginatedUsers {
  data: PublicUser[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("Usuario no encontrado", {
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  }
  return serializeUser(user);
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("Usuario no encontrado", {
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { displayName: input.displayName },
  });
  return serializeUser(updated);
}

export async function listUsers(query: ListUsersQuery): Promise<PaginatedUsers> {
  const { page, pageSize } = query;

  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    data: users.map(serializeUser),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getUserById(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("Usuario no encontrado", {
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  }
  return serializeUser(user);
}

export async function setStatus(
  userId: string,
  input: UpdateStatusInput,
): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("Usuario no encontrado", {
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status: input.status },
  });
  return serializeUser(updated);
}
