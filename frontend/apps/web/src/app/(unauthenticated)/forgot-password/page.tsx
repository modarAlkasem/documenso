import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "~/components/forms/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default async function ForgotPassword() {
  return (
    <div className="w-screen max-w-lg px-4">
      <div className="w-full">
        <h1 className="text-3xl font-semibold">Forgot your password?</h1>

        <p className="mt-2 text-muted-foreground text-sm">
          No worries, it happens! Enter your email and we'll email you with a
          special link to reset your password.
        </p>
        <ForgotPasswordForm />
        <p className="text-sm text-muted-foreground mt-6">
          Remembered your password?{" "}
          <Link
            href="/signin"
            className="text-primary transition-colors duration-200  hover:opacity-70"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
