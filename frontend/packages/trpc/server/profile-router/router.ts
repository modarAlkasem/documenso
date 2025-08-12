import { router, procedure } from "../trpc";
import { ZConfirmationEmailMutationSchema } from "./schema";
import { jobsClient } from "@documenso/lib/jobs/client";

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
});
