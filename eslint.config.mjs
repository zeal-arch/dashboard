import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated service worker
    "public/sw.js",
    "public/sw.js.map",
    // Vendored third-party hooks (unmodified source)
    "src/hooks/usehooks/**",
    // Node.js utility scripts (not part of the Next.js app bundle)
    "generate-translations.js",
    "test-translate.js",
  ]),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "prefer-const": "error",
      "no-console": "warn",
    },
  },
  // logger.ts is the only file permitted to call console directly.
  // All other files must route through the logger utility.
  {
    files: ["src/utils/logger.ts"],
    rules: {
      "no-console": "off",
    },
  },
]);

export default eslintConfig;
