import { defineConfig } from "vitest/config";
export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      "server-only": new URL("./tests/server-only.ts", import.meta.url)
        .pathname,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/domain/**/*.ts", "src/auth/origin.ts"],
    },
  },
});
