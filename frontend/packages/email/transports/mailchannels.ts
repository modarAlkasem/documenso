import { SentMessageInfo, Transport } from "nodemailer";
import type { Address } from "nodemailer/lib/mailer";
import type MailMessage from "nodemailer/lib/mailer/mail-message";
import {
  NEXT_PRIVATE_MAILCHANNELS_PRIVATE_KEY,
  NEXT_PRIVATE_MAILCHANNELS_DKIM_DOMAIN,
  NEXT_PRIVATE_MAILCHANNELS_DKIM_SELECTOR,
} from "@documenso/lib/constants/app";

const VERSION = "1.0.0";

type NodeMailerAddress = string | Address | Array<string | Address> | undefined;

interface MailChannelsAddress {
  email: string;
  name?: string;
}

interface MailChannelsTransportOptions {
  apiKey: string;
  endpoint: string;
}

export class MailChannelsTransport implements Transport<SentMessageInfo> {
  public name = "ClouddflareMailTransport";
  public version = VERSION;

  private _options: MailChannelsTransportOptions;

  public static makeTransport(options: Partial<MailChannelsTransportOptions>) {
    return new MailChannelsTransport(options);
  }

  public constructor(options: Partial<MailChannelsTransportOptions>) {
    const {
      apiKey = "",
      endpoint = "https://api.mailchannels.net/tx/v1/send",
    } = options;
    this._options = {
      apiKey,
      endpoint,
    };
  }

  public send(
    mail: MailMessage,
    callback: (_err: Error | null, _info: SentMessageInfo) => void
  ): void {
    if (!mail.data.to || !mail.data.from) {
      return callback(
        new Error('Missing required fields "from" or "to" '),
        null
      );
    }

    const mailTo = this.toMailChannelsAddress(mail.data.to);
    const mailCc = this.toMailChannelsAddress(mail.data.cc);
    const mailBcc = this.toMailChannelsAddress(mail.data.bcc);

    const mailFrom: MailChannelsAddress =
      typeof mail.data.from === "string"
        ? {
            email: mail.data.from,
          }
        : {
            email: mail.data.from?.address,
            name: mail.data.from?.name,
          };

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this._options.apiKey) {
      requestHeaders["X-Auth-Token"] = this._options.apiKey;
    }

    fetch(this._options.endpoint, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        from: mailFrom,
        subject: mail.data.subject,
        personalizations: [
          {
            to: mailTo,
            cc: mailCc,
            bcc: mailBcc,
            dkim_domain: NEXT_PRIVATE_MAILCHANNELS_DKIM_DOMAIN() || undefined,
            dkim_selector:
              NEXT_PRIVATE_MAILCHANNELS_DKIM_SELECTOR() || undefined,
            dkim_private_key:
              NEXT_PRIVATE_MAILCHANNELS_PRIVATE_KEY() || undefined,
          },
        ],
        content: [
          {
            type: "text/plain",
            value: mail.data.text?.toString("utf-8") ?? "",
          },
          {
            type: "text/html",
            value: mail.data.html?.toString("utf-8") ?? "",
          },
        ],
      }),
    })
      .then((res) => {
        if (res.status >= 200 && res.status <= 299) {
          return callback(null, {
            messageId: "",
            envelope: {
              from: mail.data.from,
              to: mail.data.to,
            },
            accepted: mail.data.to,
            rejected: [],
            pending: [],
          });
        }

        res
          .json()
          .then((data) =>
            callback(new Error(`MailChannels error: ${data.message}`), null)
          )
          .catch((err) => callback(err, null));
      })
      .catch((err) => callback(err, null));
  }

  private toMailChannelsAddress(
    address: NodeMailerAddress
  ): Array<MailChannelsAddress> {
    if (!address) {
      return [];
    }

    if (typeof address === "string") return [{ email: address }];

    if (Array.isArray(address)) {
      return address.map((addr) => {
        if (typeof addr === "string") return { email: addr };

        return {
          email: addr.address,
          name: addr.name,
        };
      });
    }
    return [{ email: address.address, name: address.name }];
  }
}
