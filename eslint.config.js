import js from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  js.configs.recommended,

  {
    files: ["apps/bff/**/*.js", "eslint.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },

  {
    files: ["apps/frontend/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
  },

  {
    files: ["**/*.js"],
    plugins: { "unused-imports": unusedImports },
    rules: {
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" }
      ],
    },
  },

  prettierConfig,

  {
    ignores: ["**/node_modules/**", "data/**", "**/dist/**"],
  },
];
