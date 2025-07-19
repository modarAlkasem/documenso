import type { Transporter } from "nodemailer";
import { createTransport } from "nodemailer";

import { MailChannelsTransport } from "./transports/mailchannels";
import { ResendTransport } from "./transports/resend";

import {
  NEXT_PRIVATE_SMTP_TRANSPORT,
  NEXT_PRIVATE_MAILCHANNELS_API_KEY,
  NEXT_PRIVATE_MAILCHANNELS_END_POINT,
  NEXT_PRIVATE_RESEND_API_KEY,
  NEXT_PRIVATE_SMTP_HOST,
  NEXT_PRIVATE_SMTP_APIKEY,
  NEXT_PRIVATE_SMTP_PORT,
  NEXT_PRIVATE_SMTP_SECURE,
  NEXT_PRIVATE_SMTP_APIKEY_USER,
  NEXT_PRIVATE_SMTP_UNSAFE_IGNORE_TLS,
  NEXT_PRIVATE_SMTP_SERVICE,
  NEXT_PRIVATE_SMTP_USERNAME,
  NEXT_PRIVATE_SMTP_PASSWORD,
} from "@documenso/lib/constants/app";

const getTransport = (): Transporter => {
  const transport = NEXT_PRIVATE_SMTP_TRANSPORT() ?? "smtp-auth";

  if (transport === "mailchannels") {
    return createTransport(
      MailChannelsTransport.makeTransport({
        apiKey: NEXT_PRIVATE_MAILCHANNELS_API_KEY(),
        endpoint: NEXT_PRIVATE_MAILCHANNELS_END_POINT(),
      })
    );
  }

  if (transport === "resend") {
    return createTransport(
      ResendTransport.makeTransport({
        apiKey: NEXT_PRIVATE_RESEND_API_KEY(),
      })
    );
  }

  if (transport === "smtp-api") {
    if (!NEXT_PRIVATE_SMTP_APIKEY() || !NEXT_PRIVATE_SMTP_HOST()) {
      throw new Error(
        'SMTP API Transport required "NEXT_PRIVATE_SMTP_HOST" and "NEXT_PRIVATE_SMTP_APIKEY"'
      );
    }

    return createTransport({
      host: NEXT_PRIVATE_SMTP_HOST() ?? undefined,
      port: Number(NEXT_PRIVATE_SMTP_PORT()) || 587,
      secure: NEXT_PRIVATE_SMTP_SECURE() === "true",
      auth: {
        user: NEXT_PRIVATE_SMTP_APIKEY_USER() ?? "apikey",
        pass: NEXT_PRIVATE_SMTP_APIKEY() ?? "",
      },
    });
  }

  return createTransport({
    url: NEXT_PRIVATE_SMTP_HOST(),
    port: Number(NEXT_PRIVATE_SMTP_PORT()) || 587,
    secure: NEXT_PRIVATE_SMTP_SECURE() === "true",
    ignoreTLS: NEXT_PRIVATE_SMTP_UNSAFE_IGNORE_TLS() === "true",
    auth: NEXT_PRIVATE_SMTP_USERNAME()
      ? {
          user: NEXT_PRIVATE_SMTP_USERNAME(),
          pass: NEXT_PRIVATE_SMTP_PASSWORD() ?? "",
        }
      : undefined,
    ...(NEXT_PRIVATE_SMTP_SERVICE()
      ? { service: NEXT_PRIVATE_SMTP_SERVICE() }
      : {}),
  });
};

export const mailer = getTransport();
