import { createElement } from "react";

import { mailer } from "@documenso/email/mailer";

import { renderEmailWithI18N } from "../../utils/render-email-with-i18n";
import {
  NEXT_PUBLIC_WEBAPP_URL,
  NEXT_PRIVATE_SMTP_FROM_ADDRESS,
  NEXT_PRIVATE_SMTP_FROM_NAME,
} from "../../constants/app";
import { ForgotPasswordTemplate } from "@documenso/email/templates/forgot-password";
import { getUserByUniqueField } from "../../api/users/fetchers";
import { CreatePasswordResetTokenResponse } from "../../api/auth/types";

export type sendForgotPasswordOptions = {
  userId: number;
};

export const sendForgotPassword = async ({
  token,
  user,
}: CreatePasswordResetTokenResponse) => {
  const assetBaseUrl = NEXT_PUBLIC_WEBAPP_URL() ?? "http://localhost:3000";

  const resetPasswordLink = `${assetBaseUrl}/reset-password/${token}`;

  const template = createElement(ForgotPasswordTemplate, {
    assetBaseUrl,
    resetPasswordLink,
  });

  const [html, text] = await Promise.all([
    renderEmailWithI18N(template),
    renderEmailWithI18N(template, {
      plainText: true,
    }),
  ]);

  return await mailer.sendMail({
    to: {
      address: user.email,
      name: user.name,
    },
    from: {
      address:
        NEXT_PRIVATE_SMTP_FROM_ADDRESS() ?? "noreply@documenso-clone.com'",
      name: NEXT_PRIVATE_SMTP_FROM_NAME() ?? "Documenso-Clone",
    },
    subject: "Forgot Password",
    text,
    html,
  });
};
