import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("identity-service · health", () => {
  const app = createApp();

  it("GET /health responde 200 con estado ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok" });
  });

  it("una ruta desconocida responde 404 con código NOT_FOUND", async () => {
    const res = await request(app).get("/ruta-que-no-existe");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });
});
