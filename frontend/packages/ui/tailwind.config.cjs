const basicConfig = require("@documenso/tailwind-config");

module.exports = {
  ...basicConfig,
  content: [
    ...basicConfig.content,
    "./primitives/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
};
