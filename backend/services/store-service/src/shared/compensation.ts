// Compensación en memoria para flujos orquestados.
// Sin base de datos. Se usa para revertir operaciones tras fallo posterior.

import { randomUUID } from "node:crypto";

export type CompensationStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

export interface CompensationLog {
  id: string;
  correlationId: string;
  service: string;
  actionType: string;
  inverseType: string;
  status: CompensationStatus;
  payload: Record<string, unknown>;
  attempts: number;
  lastError?: string | null;
  createdAt: number;
  updatedAt: number;
  completedAt?: number | null;
}

const store = new Map<string, CompensationLog>();

/** Crea log de compensación. */
export function createCompensationLog(input: {
  correlationId?: string;
  service: string;
  actionType: string;
  inverseType: string;
  payload: Record<string, unknown>;
}): CompensationLog {
  const id = randomUUID();
  const correlationId = input.correlationId ?? id;
  const now = Date.now();
  const log: CompensationLog = {
    id,
    correlationId,
    service: input.service,
    actionType: input.actionType,
    inverseType: input.inverseType,
    status: "PENDING",
    payload: input.payload,
    attempts: 0,
    lastError: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
  store.set(correlationId, log);
  return log;
}

/** Obtiene log por correlationId. */
export function getCompensationLog(correlationId: string): CompensationLog | undefined {
  return store.get(correlationId);
}

/** Marca log como en progreso. */
export function markCompensationInProgress(correlationId: string): CompensationLog | undefined {
  const log = store.get(correlationId);
  if (!log) return undefined;
  log.status = "IN_PROGRESS";
  log.attempts += 1;
  log.updatedAt = Date.now();
  store.set(correlationId, log);
  return log;
}

/** Marca log como completado. */
export function markCompensationCompleted(correlationId: string): CompensationLog | undefined {
  const log = store.get(correlationId);
  if (!log) return undefined;
  log.status = "COMPLETED";
  log.completedAt = Date.now();
  log.updatedAt = Date.now();
  log.lastError = null;
  store.set(correlationId, log);
  return log;
}

/** Marca log como fallido. */
export function markCompensationFailed(correlationId: string, error: string): CompensationLog | undefined {
  const log = store.get(correlationId);
  if (!log) return undefined;
  log.status = "FAILED";
  log.lastError = error;
  log.updatedAt = Date.now();
  store.set(correlationId, log);
  return log;
}
