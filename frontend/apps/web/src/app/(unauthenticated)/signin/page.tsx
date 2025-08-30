import type { Metadata } from "next";
import Link from "next/link";

import { env } from "next-runtime-env";
import {
  IS_GOOGLE_SSO_ENABLED,
  IS_OIDC_SSO_ENABLED,
  OIDC_PROVIDER_LABEL,
} from "@documenso/lib/constants/auth";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function SignInPage() {}
