import Link from "next/link";

import { AlertTriangle, XCircle, XOctagon } from "lucide-react";
import { DateTime } from "luxon";
import { match } from "ts-pattern";

import { encryptSecondaryData } from "@documenso/lib/server-only/crypto/encrypt";
import { Button } from "@documenso/ui/primitives/button";
import {
  verifyEmail,
  type EMAIL_VERIFICATION_STATE,
} from "@documenso/lib/server-only/user/verify-email";

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
}
