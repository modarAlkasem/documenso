import { env } from "next-runtime-env";

export const NEXT_PUBLIC_WEBAPP_URL = () => env("NEXT_PUBLIC_WEBAPP_URL");

export const IS_APP_WEB = process.env.NEXT_PUBLIC_WEB_PROJECT === "web";
export const IS_APP_WEB_I18N_ENABLED = true;

export const NEXT_PUBLIC_SIGNUP_DISABLED = () =>
  env("NEXT_PUBLIC_SIGNUP_DISABLED");

export const IS_BILLING_ENABLED = () =>
  env("NEXT_PUBLIC_FEATURE_BILLING_ENABLED");

export const NEXT_PRIVATE_INNGEST_APP_ID = () =>
  env("NEXT_PRIVATE_INNGEST_APP_ID");

export const INNGEST_EVENT_KEY = () => env("INNGEST_EVENT_KEY");
export const NEXT_PRIVATE_INTERNAL_WEBAPP_URL = () =>
  env("NEXT_PRIVATE_INTERNAL_WEBAPP_URL") ?? NEXT_PUBLIC_WEBAPP_URL();
export const TRIGGER_SECRET_KEY = () => env("TRIGGER_SECRET_KEY");
export const TRIGGER_API_URL = () => env("TRIGGER_API_URL");
