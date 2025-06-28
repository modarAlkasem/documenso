
import type { Config } from "tailwindcss";

const basicConfig = require ("@documenso/tailwind-config");
const path = require("path");

module.exports = {
  ...basicConfig,
  content:[
    ...basicConfig.content,
    `${path.join(require.resolve('@documenso/ui'), '..')}/components/**/*.{ts,tsx}`,
    `${path.join(require.resolve('@documenso/ui'), '..')}/icons/**/*.{ts,tsx}`,
    `${path.join(require.resolve('@documenso/ui'), '..')}/lib/**/*.{ts,tsx}`,
    `${path.join(require.resolve('@documenso/ui'), '..')}/primitives/**/*.{ts,tsx}`,
    // `${path.join(require.resolve('@documenso/email'), '..')}/templates/**/*.{ts,tsx}`,
    // `${path.join(require.resolve('@documenso/email'), '..')}/template-components/**/*.{ts,tsx}`,
    // `${path.join(require.resolve('@documenso/email'), '..')}/providers/**/*.{ts,tsx}`,


  ]
}satisfies Config;





