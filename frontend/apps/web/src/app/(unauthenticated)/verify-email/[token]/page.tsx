import Link from "next/link";

import { AlertTriangle, XCircle, XOctagon } from "lucide-react";
import { DateTime } from "luxon";
import { match } from "ts-pattern";

import { encryptSecondaryData } from "@documenso/lib/server-only/crypto/encrypt";
import { Button } from "@documenso/ui/primitives/button";
import {
  EMAIL_VERIFICATION_STATE,
  verifyEmail,
} from "@documenso/lib/server-only/user/verify-email";
import { getVerificationTokenWithUser } from "@documenso/lib/api/auth/fetchers";
import { VerifyEmailClientPage } from "./client";

export type VerifyEmailProps = {
  params: {
    token: string;
  };
};
export default async function VerifyEmailPage({
  params: { token },
}: VerifyEmailProps) {
  if (!token) {
    return (
      <div className="w-screen max-w-lg px-4">
        <div className="w-full">
          <div className="mb-4 text-red-300">
            <XOctagon />
          </div>
          <h2 className="text-4xl font-semibold">No token provided</h2>
          <p className="text-muted-foreground mt-2 text-base">
            It seems that there is no token provided. Please check your email
            and try again.
          </p>
        </div>
      </div>
    );
  }

  const verified = await verifyEmail({ token });
  return await match(verified)
    .with(EMAIL_VERIFICATION_STATE.NOT_FOUND, () => {
      return (
        <div className="w-screen max-w-lg px-4">
          <div className="flex w-full items-start">
            <div className="mr-4 mt-1 hidden md:block">
              <AlertTriangle
                className="h-10 w-10 text-yellow-500"
                strokeWidth={2}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold md:text-4xl">
                Something went wrong
              </h2>
              <p className="mt-4 text-muted-foreground">
                We were unable to verify your email. If your email is not
                verified already, please try again.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/">Go back home</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    })
    .with(EMAIL_VERIFICATION_STATE.EXPIRED, () => (
      <div className="w-screen max-w-lg px-4">
        <div className="flex w-full items-start">
          <div className="mr-4 mt-1 hidden md:block">
            <XCircle className="h-10 w-10 text-destructive" strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-bold text-2xl md:text-4xl">
              Your token has expired!
            </h2>
            <p className="text-muted-foreground mt-4">
              It seems that the provided token has expired. We've just sent you
              another token, please check your email and try again.
            </p>
            <Button asChild className="mt-4">
              <Link href="/"> Go back home</Link>
            </Button>
          </div>
        </div>
      </div>
    ))
    .with(EMAIL_VERIFICATION_STATE.VERIFIED, async () => {
      const user = (await getVerificationTokenWithUser(token)).user;

      const data = encryptSecondaryData({
        data: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
        expiresAt: DateTime.now().plus({ minutes: 5 }).toMillis(),
      });
      return <VerifyEmailClientPage signInData={data} />;
    })
    .with(EMAIL_VERIFICATION_STATE.ALREADY_VERIFIED, () => {
      <VerifyEmailClientPage />;
    });
}
