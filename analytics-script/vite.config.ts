import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "RybbitAnalytics",
      formats: ["iife"],
      fileName: () => (mode === "development" ? "script-full.js" : "script.js"),
    },
    outDir: "../server/public",
    emptyOutDir: false, // Don't clear the entire public directory
    minify: mode === "production",
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        // Ensure the IIFE is self-executing
        format: "iife",
        // Remove any external dependencies by bundling everything
        inlineDynamicImports: true,
      },
      external: [], // Bundle everything, including web-vitals
    },
    target: "es2020",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  define: {
    // Define any build-time constants if needed
    __DEV__: mode === "development",
  },
}));
