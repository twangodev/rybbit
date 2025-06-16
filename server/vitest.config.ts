import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    environmentMatchGlobs: [
      // Use jsdom for analytics script tests
      ["src/analytics-script/**", "jsdom"],
    ],
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
