import { router, procedure } from "../trpc";
import {
  ZConfirmationEmailMutationSchema,
  ZForgotPasswordSchema,
} from "./schema";
import { jobsClient } from "@documenso/lib/jobs/client";
import { forgotPassword } from "@documenso/lib/server-only/user/forgot-password";

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
});
