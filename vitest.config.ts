import path from "path";
import { fileURLToPath } from "url";
import { configDefaults, defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: [...configDefaults.exclude, "**/.worktrees/**", "**/.opencode/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "."),
    },
  },
});
