import { env } from "next-runtime-env";

export const NEXT_PUBLIC_WEBAPP_URL = () => env("NEXT_PUBLIC_WEBAPP_URL");

export const IS_APP_WEB = process.env.NEXT_PUBLIC_WEB_PROJECT === "web";
export const IS_APP_WEB_I18N_ENABLED = true;

export const NEXT_PUBLIC_SIGNUP_DISABLED = () =>
  env("NEXT_PUBLIC_SIGNUP_DISABLED");

export const IS_BILLING_ENABLED = () =>
  env("NEXT_PUBLIC_FEATURE_BILLING_ENABLED");
