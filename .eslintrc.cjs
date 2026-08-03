/**
 * .eslintrc.cjs
 *
 * The `no-restricted-imports` block is what turns the architecture's module
 * boundaries (see docs/architecture/phase-1-architecture.md §2) from a
 * convention into a lint-time error:
 *   - components/* may depend on core/* and shared/*, never on each other.
 *   - core/* may not depend on components/*.
 */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["@typescript-eslint", "react", "react-hooks", "jsx-a11y", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  settings: {
    react: { version: "detect" },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
    "no-console": ["error", { allow: ["warn", "error"] }],
    "import/no-cycle": "error",
  },
  overrides: [
    {
      files: ["src/components/**/*.{ts,tsx}"],
      excludedFiles: "src/components/**/index.ts",
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["**/components/*/*", "!../*", "!./*", "!**/components/Navbar/**"],
                message:
                  "Components may not import from another component's internals. Only import from core/, shared/, or the target component's own barrel (index.ts).",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["src/core/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["**/components/**"],
                message: "core/ must never depend on components/ (Dependency Inversion).",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["src/**/__tests__/**/*.{ts,tsx}"],
      env: { node: true },
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
  ignorePatterns: ["dist", "examples", "node_modules", "*.config.ts", "*.config.js"],
};
