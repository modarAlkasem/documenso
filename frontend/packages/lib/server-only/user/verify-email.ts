import { DateTime } from "luxon";
import { jobsClient } from "../../jobs/client";
import { verifyToken as verifyTokenFetcher } from "@documenso/lib/api/auth/fetchers";

export const EMAIL_VERIFICATION_STATE = {
  NOT_FOUND: "NOT_FOUND",
  VERIFIED: "VERIFIED",
  EXPIRED: "EXPIRED",
  ALREADY_VERIFIED: "ALREADY_VERIFIED",
} as const;

export type verifyEmailProps = {
  token: string;
};

export const verifyEmail = async ({ token }: verifyEmailProps) => {
  const response = await verifyTokenFetcher({
    token,
    identifier: "confirmation-email",
  });
  const status = response.status;
  if (status === "EXPIRED")
    jobsClient.triggerJob({
      name: "send.signup.confirmation.email",
      payload: {
        email: response.user?.email as string,
      },
    });
};
