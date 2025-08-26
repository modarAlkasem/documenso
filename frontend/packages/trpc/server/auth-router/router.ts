import { router, procedure } from "../trpc";
import { ZSignUpMutationSchema } from "./schema";
import {
  IS_BILLING_ENABLED,
  NEXT_PUBLIC_SIGNUP_DISABLED,
} from "@documenso/lib/constants/app";
import { AppError, AppErrorCode } from "@documenso/lib/errors/app-error";
import { createAccount } from "@documenso/lib/api/account/fetchers";
import { jobsClient } from "@documenso/lib/jobs/client";

export const authRouter = router({
  signup: procedure.input(ZSignUpMutationSchema).mutation(async ({ input }) => {
    if (NEXT_PUBLIC_SIGNUP_DISABLED()) {
      throw new AppError("SIGNUP_DISABLED", {
        message: "Signups are disabled.",
      });
    }
    const { name, email, password, url, signature } = input;
    if (IS_BILLING_ENABLED() && url && url.length < 6) {
      throw new AppError(AppErrorCode.PREMIUM_PROFILE_URL, {
        message:
          "Only subscribers can have username shorter than 6 characters.",
      });
    }
    const account = await createAccount({
      provider: "manual",
      type: "credentials",
      provider_account_id: "",
      user: { name, email, password, url, signature },
    });
    await jobsClient.triggerJob({
      name: "send.signup.confirmation.email",
      payload: {
        email: account.user.email,
      },
    });
    return account.user;
  }),
});
