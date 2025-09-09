import { TForgotPasswordSchema } from "@documenso/trpc/server/profile-router/schema";

export const forgotPassword = async ({ email }: TForgotPasswordSchema) => {
  return "test";
};
