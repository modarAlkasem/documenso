import { string, z } from "zod";
import { ZPasswordSchema } from "../auth-router/schema";

export const ZConfirmationEmailMutationSchema = z.object({
  email: z.string().email(),
});

export const ZForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type TForgotPasswordSchema = z.infer<typeof ZForgotPasswordSchema>;

export const ZResetPasswordSchema = z.object({
  password: ZPasswordSchema,
  token: z.string(),
});
