import { TForgotPasswordSchema } from "@documenso/trpc/server/profile-router/schema";
import { sendForgotPassword } from "../auth/send-forgot-password";

export const forgotPassword = async ({ email }: TForgotPasswordSchema) => {
  return "test";
};
