import { router } from "./trpc";
import { authRouter } from "./auth-router/router";
import { profileRouter } from "./profile-router/router";

export const appRouter = router({
  auth: authRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
