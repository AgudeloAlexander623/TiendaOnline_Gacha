// Validación del módulo de recompensas (minijuegos).

import { z } from "zod";

export const startSessionSchema = z.object({
  gameType: z.enum(["MINIGAME"]).default("MINIGAME"),
});

export const finishSessionSchema = z.object({
  score: z.coerce.number().int().min(0).max(1_000_000),
});

export const sessionIdParamSchema = z.object({ sessionId: z.uuid() });

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type FinishSessionInput = z.infer<typeof finishSessionSchema>;
