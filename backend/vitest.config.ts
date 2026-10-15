import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "services/*/tests/**/*.test.ts",
      "services/*/src/**/*.test.ts",
      "packages/*/tests/**/*.test.ts",
      "packages/*/src/**/*.test.ts",
    ],
  },
});
