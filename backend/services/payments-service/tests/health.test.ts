import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("payments-service · health", () => {
  const app = createApp();

  it("GET /health responde 200 con estado ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok" });
  });

  it("GET /api/v1/payments/me sin token responde 401", async () => {
    const res = await request(app).get("/api/v1/payments/me");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("MISSING_TOKEN");
  });
});
