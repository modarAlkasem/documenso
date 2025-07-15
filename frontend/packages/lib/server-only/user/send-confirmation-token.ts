import { useMutation } from "@tanstack/react-query";

import { createVerificationToken } from "../../api/auth/fetchers";
import { ONE_HOUR } from "../../constants/time";

const IDENTIFIER = "confirmation-email";

type SendConfirmationTokenOptions = {
  email: string;
  force?: boolean;
};
export const sendConfirmationToken = async ({
  email,
  force = false,
}: SendConfirmationTokenOptions) => {
  const { mutate } = useMutation({
    mutationKey: ["createVerificationToken"],
    mutationFn: createVerificationToken,
    onSuccess: (data, variables, context) => {},
    onError: (err, variables, context) => {
      throw new Error(err.message);
    },
  });

  await mutate({
    email,
    force,
    identifier: IDENTIFIER,
    expires_at: new Date(Date.now() + ONE_HOUR),
  });
};
