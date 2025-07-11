import { sendConfirmationToken } from "../../../server-only/user/send-confirmation-token";
import type { SendConfirmationEmailJobDefinition } from "./send-confirmation-email";

export const run = async ({
  payload,
}: {
  payload: SendConfirmationEmailJobDefinition;
}) => {
  await sendConfirmationToken({
    email: payload.email,
    force: payload.force,
  });
};
