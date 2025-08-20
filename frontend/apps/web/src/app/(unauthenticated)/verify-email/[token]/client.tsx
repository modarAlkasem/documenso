"use client";

import { useEffect } from "react";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@documenso/ui/primitives/button";

export type VerifyEmailClientProps = {
  signInData?: string;
};

export const VerifyEmailClientPage = ({
  signInData,
}: VerifyEmailClientProps) => {
  useEffect(() => {
    if (signInData) {
      signIn("manual", {
        credential: signInData,
        callbackUrl: "/documents",
      });
    }
  }, [signInData]);

  return (
    <div className="w-screen max-w-lg px-4">
      <div className="flex w-full items-start">
        <div className="mr-4 mt-1 hidden md:block">
          <CheckCircle2 className="text-green-500 h-10 w-10" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-2xl font-bold md:text-4xl">Email Confirmed!</h2>
          <p className="text-muted-foreground mt-4">
            Your email has been successfully confirmed! You can now use all
            features of Documenso.
          </p>
          {!signInData && (
            <Button className="mt-4" asChild>
              <Link href="/">Go back home</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
