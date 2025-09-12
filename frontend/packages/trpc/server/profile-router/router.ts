import { extractNextRequestMetadata } from "@documenso/lib/universal/extract-request-metadata";
import { router, procedure } from "../trpc";
import {
  ZConfirmationEmailMutationSchema,
  ZForgotPasswordSchema,
  ZResetPasswordSchema,
} from "./schema";
import { jobsClient } from "@documenso/lib/jobs/client";
import { forgotPassword } from "@documenso/lib/server-only/user/forgot-password";
import { resetPassword } from "@documenso/lib/server-only/user/reset-password";

export const profileRouter = router({
  sendConfirmationEmail: procedure
    .input(ZConfirmationEmailMutationSchema)
    .mutation(async ({ input }) => {
      const { email } = input;
      jobsClient.triggerJob({
        name: "send.signup.confirmation.email",
        payload: {
          email,
        },
      });
    }),
  forgotPassword: procedure
    .input(ZForgotPasswordSchema)
    .mutation(async ({ input }) => {
      const { email } = input;
      return await forgotPassword({ email });
    }),
  resetPassword: procedure
    .input(ZResetPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const { password, token } = input;

      return await resetPassword({
        password,
        token,
        requestMetadata: extractNextRequestMetadata(ctx.req),
      });
    }),
});
