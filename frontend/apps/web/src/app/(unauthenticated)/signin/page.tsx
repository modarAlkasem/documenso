import type { Metadata } from "next";
import Link from "next/link";

import { env } from "next-runtime-env";
import {
  IS_GOOGLE_SSO_ENABLED,
  IS_OIDC_SSO_ENABLED,
  OIDC_PROVIDER_LABEL,
} from "@documenso/lib/constants/auth";

import { SignInForm } from "~/components/forms/signin-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function SignInPage() {
  const NEXT_PUBLIC_DISABLE_SIGNUP = env("NEXT_PUBLIC_DISABLE_SIGNUP");

  return (
    <div className="w-screen max-w-lg px-4">
      <div className="border border-border dark:bg-background bg-neutral-100 p-6 z-10 rounded-xl">
        <h1 className="text-2xl font-semibold"> Sign in to your account</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Welcome back, we are lucky to have you.
        </p>
        <hr className="my-4 -mx-6" />
        <SignInForm
          isGoogleSSOEnabled={Boolean(IS_GOOGLE_SSO_ENABLED) ?? true}
          isOIDCSSOEnabled={Boolean(IS_OIDC_SSO_ENABLED) ?? false}
          oidcProviderLabel={OIDC_PROVIDER_LABEL}
        />
        {NEXT_PUBLIC_DISABLE_SIGNUP !== "true" && (
          <p className="text-muted-foreground mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="transition text-documenso-700 duration-200 hover:opacity-70"
            >
              Sign up
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
