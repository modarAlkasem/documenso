/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ["@documenso/eslint-config"],
  rules: {
    "@next/next/no-img-element": "off",
    "no-unreachable": "error",
    "@typescript-eslint/no-var-requires": "off",
  },
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
  ignorePatterns: ["lingui.config.ts", "packages/lib/translations/**/*.js"],
};
