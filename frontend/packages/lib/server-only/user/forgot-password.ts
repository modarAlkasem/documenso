import { TForgotPasswordSchema } from "@documenso/trpc/server/profile-router/schema";
import { sendForgotPassword } from "../auth/send-forgot-password";
import { createPasswordResetToken } from "../../api/auth/fetchers";

const CREATE_PASSWORD_RESET_TOKEN_STATUS = [
  "CREATED",
  "VALID_ONE_EXISTING",
  "BAD_REQUEST",
];
export const forgotPassword = async ({ email }: TForgotPasswordSchema) => {
  const result = await createPasswordResetToken({ email }).catch((err) => {
    if (CREATE_PASSWORD_RESET_TOKEN_STATUS.includes(err.message)) {
      return null;
    }
    throw new Error("Something went wrong.");
  });

  if (!result) return;

  await sendForgotPassword(result);
};
