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

vi.mock("../src/modules/internal/internal.service.js", () => ({
  getInternalBalance: vi.fn(),
  debitInternal: vi.fn(),
  creditInternal: vi.fn(),
}));

import { getInternalBalance, debitInternal, creditInternal } from "../src/modules/internal/internal.service.js";

describe("economy-service · internal wallet", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
    (verifyServiceToken as any).mockReturnValue({
      iss: "store-service",
      sub: "store-service",
      aud: "internal",
      scope: ["wallet:read", "wallet:debit", "wallet:credit"],
      jti: "test",
    });
  });

  it("GET /internal/wallets/:userId/balance requiere token servicio", async () => {
    (verifyServiceToken as any).mockImplementationOnce(() => {
      throw new Error("bad");
    });
    const res = await request(app).get("/internal/wallets/u1/balance");
    expect(res.status).toBe(401);
  });

  it("GET /internal/wallets/:userId/balance retorna saldo", async () => {
    (getInternalBalance as any).mockResolvedValue({
      userId: "u1",
      available: 1000,
      byType: { EARNED: 800, PURCHASED: 200 },
      asOf: new Date().toISOString(),
    });
    const res = await request(app)
      .get("/internal/wallets/u1/balance")
      .set("Authorization", "Bearer s");
    expect(res.status).toBe(200);
    expect(res.body.available).toBe(1000);
  });

  it("POST /internal/wallets/:userId/debit con FIFO retorna batchesConsumed", async () => {
    (debitInternal as any).mockResolvedValue({
      debited: 500,
      balanceAfter: 500,
      batchesConsumed: [{ batchId: "b1", type: "EARNED", amount: 500 }],
      transactionId: "t1",
    });
    const res = await request(app)
      .post("/internal/wallets/u1/debit")
      .set("Authorization", "Bearer s")
      .send({ amount: 500, referenceType: "order", referenceId: "o1" });
    expect(res.status).toBe(200);
    expect(res.body.batchesConsumed[0].batchId).toBe("b1");
  });

  it("POST /internal/wallets/:userId/credit PURCHASED sin vencimiento", async () => {
    (creditInternal as any).mockResolvedValue({
      credited: 300,
      balanceAfter: 1300,
      batchId: "b2",
    });
    const res = await request(app)
      .post("/internal/wallets/u1/credit")
      .set("Authorization", "Bearer s")
      .send({ amount: 300, coinType: "PURCHASED", source: "PURCHASE" });
    expect(res.status).toBe(200);
    expect(res.body.batchId).toBe("b2");
  });
});
