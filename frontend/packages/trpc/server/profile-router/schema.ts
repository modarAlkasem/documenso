import { z } from "zod";

export const ZConfirmationEmailMutationSchema = z.object({
  email: z.string().email(),
});

export const ZForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type TForgotPasswordSchema = z.infer<typeof ZForgotPasswordSchema>;
