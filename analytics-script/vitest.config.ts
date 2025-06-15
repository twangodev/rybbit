import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    // Allow importing .js files that are actually .ts files
    extensions: [".ts", ".js", ".tsx", ".jsx"],
  },
  esbuild: {
    // Enable TypeScript compilation for tests
    target: "es2020",
  },
});
