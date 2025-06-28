import {env} from "next-runtime-env";

export const NEXT_PUBLIC_WEBAPP_URL = () => env("NEXT_PUBLIC_WEBAPP_URL");

export const IS_APP_WEB= process.env.NEXT_PUBLIC_WEB_PROJECT === "web";
export const IS_APP_WEB_I18N_ENABLED = true;
