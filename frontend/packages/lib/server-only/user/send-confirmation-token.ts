import { createVerificationToken } from "../../api/auth/fetchers";
import { ONE_HOUR } from "../../constants/time";
import { identifierOptions } from "../../api/auth/types";

const IDENTIFIER = "confirmation-email";

type SendConfirmationTokenOptions = {
  email: string;
  force?: boolean;
};
export const sendConfirmationToken = async ({
  email,
  force = false,
}: SendConfirmationTokenOptions) => {
  const payload = {
    email,
    force,
    identifier: IDENTIFIER as identifierOptions,
    expires_at: new Date(Date.now() + ONE_HOUR),
  };
  const token = await createVerificationToken(payload);
};
