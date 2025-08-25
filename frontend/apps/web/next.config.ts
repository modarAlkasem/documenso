import type { NextConfig } from "next";
const path = require("path");
import { withAxiom } from "next-axiom";

const ENV_FILES = [
  ".env",
  ".env.local",
  `.env.${process.env.NODE_ENV || "development"}`,
];
ENV_FILES.forEach((file) => {
  require("dotenv").config({
    path: path.join(__dirname, `../../${file}`),
  });
});

const config: NextConfig = {
  experimental: {
    // swcPlugins:[["@lingui/swc-plugin",{}]],
    // turbo: {
    //   rules: {
    //     '*.po': {
    //       loaders: ['@lingui/loader'],
    //       as: '*.js'
    //     }
    //   }
    // }
  },
  // webpack:(config,{isServer}) =>{
  //   if(isServer)
  //     config.resolve.alias.canvas = false;

  //   config.module.rules.push({
  //     test:/\.po$/,
  //     use:{
  //       loader:"@lingui/loader"
  //     }
  //   });
  //   return config;

  // }
  transpilePackages: [
    "@documenso/lib",
    "@documenso/ui",
    "@documenso/trpc",
    "@documenso/tailwind-config",
    "@documenso/assets",
  ],
};

export default withAxiom(config);
