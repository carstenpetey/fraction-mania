// creating a config file for vitest so that we can separate
// vitest files from playwright test files
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // what to include for vitest files
    include: ["src/tests/vitest/**/*.test.ts"],

    // we want to exclude all playwright files
    exclude: ["src/tests/playwright/**/*", "**/*.spec.ts", "**/*.pw.spec.ts"],
  },
});
