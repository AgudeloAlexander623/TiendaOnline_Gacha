import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { verifyServiceToken } from "../src/shared/jwt.js";

vi.mock("../src/shared/jwt.js", async () => {
  const actual = await vi.importActual<typeof import("../src/shared/jwt.js")>("../src/shared/jwt.js");
  return {
    ...actual,
    verifyServiceToken: vi.fn(),
  };
});

vi.mock("../src/modules/internal/gameSessions.service.js", () => ({
  validateGameSessionInternal: vi.fn(),
}));

import { validateGameSessionInternal } from "../src/modules/internal/gameSessions.service.js";

describe("economy-service · internal game session", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
    (verifyServiceToken as any).mockReturnValue({
      iss: "game-client",
      sub: "game-client",
      aud: "internal",
      scope: ["game:validate"],
      jti: "test",
    });
  });

  it("POST /internal/game-sessions/:id/validate solo FINISHED otorga", async () => {
    (validateGameSessionInternal as any).mockResolvedValue({
      sessionId: "s1",
      status: "FINISHED",
      earned: 320,
      batchId: "b1",
      cappedBy: 500,
      itemsRetained: true,
    });
    const res = await request(app)
      .post("/internal/game-sessions/s1/validate")
      .set("Authorization", "Bearer s")
      .send({ userId: "00000000-0000-0000-0000-000000000001", gameType: "MINIGAME", outcome: "FINISHED", score: 320 });
    expect(res.status).toBe(200);
    expect(res.body.earned).toBe(320);
    expect(res.body.itemsRetained).toBe(true);
  });

  it("ABANDONED no otorga monedas pero conserva estado", async () => {
    (validateGameSessionInternal as any).mockResolvedValue({
      sessionId: "s2",
      status: "ABANDONED",
      earned: 0,
      batchId: undefined,
      cappedBy: 500,
      itemsRetained: false,
    });
    const res = await request(app)
      .post("/internal/game-sessions/s2/validate")
      .set("Authorization", "Bearer s")
      .send({ userId: "00000000-0000-0000-0000-000000000001", gameType: "MINIGAME", outcome: "ABANDONED" });
    expect(res.status).toBe(200);
    expect(res.body.earned).toBe(0);
    expect(res.body.itemsRetained).toBe(false);
  });

  it("REJECTED descarta resultado", async () => {
    (validateGameSessionInternal as any).mockResolvedValue({
      sessionId: "s3",
      status: "REJECTED",
      earned: 0,
      batchId: undefined,
      cappedBy: 500,
      itemsRetained: true,
    });
    const res = await request(app)
      .post("/internal/game-sessions/s3/validate")
      .set("Authorization", "Bearer s")
      .send({ userId: "00000000-0000-0000-0000-000000000001", gameType: "MINIGAME", outcome: "REJECTED" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("REJECTED");
    expect(res.body.earned).toBe(0);
  });
});
