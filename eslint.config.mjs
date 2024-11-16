import globals from "globals";
import js from "@eslint/js";
import eslintPluginVue from "eslint-plugin-vue";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

import ts from "typescript-eslint";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...eslintPluginVue.configs["flat/vue2-recommended"],
  eslintPluginPrettierRecommended,
  {
    files: ["*.vue", "**/*.vue"],

    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },

    rules: {
      "vue/script-setup-uses-vars": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
);
