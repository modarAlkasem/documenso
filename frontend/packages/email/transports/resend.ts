import type { SentMessageInfo, Transport } from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import type MailMessage from "nodemailer/lib/mailer/mail-message";
import { Resend } from "resend";
import { NEXT_PRIVATE_RESEND_API_KEY } from "@documenso/lib/constants/app";

export const RESEND_ERROR_CODES_BY_KEY = {
  missing_required_field: 422,
  invalid_access: 422,
  invalid_parameter: 422,
  invalid_region: 422,
  rate_limit_exceeded: 429,
  missing_api_key: 401,
  invalid_api_Key: 403,
  invalid_from_address: 403,
  validation_error: 403,
  invalid_idempotency_key: 403,
  invalid_idempotent_request: 403,
  concurrent_idempotent_requests: 403,
  not_found: 404,
  method_not_allowed: 405,
  application_error: 500,
  internal_server_error: 500,
};

type ResendTransportOptions = {
  apiKey: string;
};

export class ResendTransport implements Transport<SentMessageInfo> {
  public name = "ResendMailTransport";
  public version = "2.0.0";

  private _client: Resend;

  public static makeTransport(options: Partial<ResendTransportOptions>) {
    const { apiKey = NEXT_PRIVATE_RESEND_API_KEY() ?? "" } = options;
    return new ResendTransport({ apiKey });
  }

  private constructor(options: ResendTransportOptions) {
    this._client = new Resend(options.apiKey);
  }

  public send(
    mail: MailMessage<any>,
    callback: (err: Error | null, info: any) => void
  ): void {
    if (!mail.data.from || !mail.data.to) {
      return callback(
        new Error('Missing required fields "to" or "from" '),
        null
      );
    }
    const mailFrom = mail.data.from;
    const mailTo = mail.data.to;
    const mailCc = mail.data.cc;
    const mailBcc = mail.data.bcc;

    this._client.emails
      .send({
        subject: mail.data.subject ?? "",
        from: this.toResendFromAddresses(mailFrom),
        to: this.toResendAddresses(mailTo),
        cc: this.toResendAddresses(mailCc),
        bcc: this.toResendAddresses(mailBcc),
        html: mail.data.html?.toString() || "",
        text: mail.data.text?.toString() || "",
        attachments: this.toResendAttachements(mail.data.attachments),
      })
      .then((res) => {
        if (res.error) {
          const statusCode = RESEND_ERROR_CODES_BY_KEY[res.error.name] ?? 500;
          callback(
            new Error(`[${statusCode}]:${res.error.name} ${res.error.message}`),
            null
          );
        }
        callback(null, res.data);
      })
      .catch((err) => {
        callback(err, null);
      });
  }

  public toResendAddresses(addresses: Mail.Options["to"]) {
    if (!addresses) {
      return [];
    }

    if (typeof addresses === "string") {
      return [addresses];
    }

    if (Array.isArray(addresses)) {
      return addresses.map((address) => {
        if (typeof address === "string") {
          return address;
        }

        return address.address;
      });
    }
    return [addresses.address];
  }

  public toResendFromAddresses(addresse: Mail.Options["from"]) {
    if (!addresse) {
      return "";
    }
    if (typeof addresse === "string") {
      return addresse;
    }

    return `${addresse.name} <${addresse.address}>`;
  }

  public toResendAttachements(attachments: Mail.Options["attachments"]) {
    if (!attachments) {
      return [];
    }
    return attachments.map((attachement) => {
      if (!attachement.filename || !attachement.content) {
        throw new Error("Attachment is missing filename or content");
      }

      if (typeof attachement.content === "string") {
        return {
          filename: attachement.filename,
          content: Buffer.from(attachement.content),
        };
      }

      if (attachement.content instanceof Buffer) {
        return {
          filename: attachement.filename,
          content: attachement.content,
        };
      }
      throw new Error("Attachment's content must be either string or buffer");
    });
  }
}
