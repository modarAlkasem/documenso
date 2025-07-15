const path = require("path");
const baseConfig = require("@documenso/tailwind-config");

module.exports = {
  ...baseConfig,
  content: [`templates/**/*.{ts,tsx}`],
};
