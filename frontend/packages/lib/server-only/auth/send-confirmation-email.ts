import { mailer } from "@documenso/email/mailer";
import { ConfirmEmail } from "@documenso/email/templates/confirm-email";
import {
  NEXT_PUBLIC_WEBAPP_URL,
  NEXT_PRIVATE_SMTP_FROM_ADDRESS,
  NEXT_PRIVATE_SMTP_FROM_NAME,
} from "../../constants/app";

import { getUserWithVerificationToken } from "../../api/users/fetchers";
import { createElement } from "react";

export interface SendConfirmationEmailProps {
  userId: number;
}
export const sendConfirmationEmail = async ({
  userId,
}: SendConfirmationEmailProps) => {
  const fromName = NEXT_PRIVATE_SMTP_FROM_NAME() ?? "Documenso-Clone";
  const fromAddress = NEXT_PRIVATE_SMTP_FROM_ADDRESS();

  const user = await getUserWithVerificationToken(userId);
  if (!user.verification_token) {
    throw new Error("Verification token not found for the user");
  }

  const assetBaseUrl = NEXT_PUBLIC_WEBAPP_URL() ?? "http://localhost:3000";
  const confirmationLink = `${assetBaseUrl}/verify-email/${user.verification_token}`;
  const confirmationTemplate = createElement(ConfirmEmail, {
    assetBaseUrl,
    confirmationLink,
  });
};
