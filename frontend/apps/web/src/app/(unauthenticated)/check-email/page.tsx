import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@documenso/ui/primitives/button";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default async function ForgotPasswordPage() {
  return (
    <div className="w-screen max-w-lg">
      <div className="w-full">
        <h1 className="text-4xl font-semibold">Email sent!</h1>
        <p className="text-muted-foreground mt-2 mb-4 text-sm">
          A password reset email has been sent, if you have an account you
          should see it in your inbox shortly.
        </p>
        <Button asChild>
          <Link href="/signin">Return to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
