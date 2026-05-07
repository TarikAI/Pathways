const nextConfig = require("eslint-config-next");

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [".next/", "out/"],
  },
  ...nextConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];

module.exports = eslintConfig;
