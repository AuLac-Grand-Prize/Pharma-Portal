import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    // Vitest auto-discovers *.test.* / *.spec.*; keep Playwright E2E specs out.
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e/**", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Scope coverage to the modules this phase targets (Req 1).
      include: [
        "lib/utils.ts",
        "lib/api.ts",
        "lib/validation/login.ts",
        "hooks/useSortable.ts",
        "hooks/useInteractionCheck.ts",
      ],
    },
  },
});
