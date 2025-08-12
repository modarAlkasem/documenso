import { AppError, AppErrorCode } from "@documenso/lib/errors/app-error";
import * as trpcNext from "@documenso/trpc/server/adapters/next";
import { createTrpcContext } from "@documenso/trpc/server/context";
import { appRouter } from "@documenso/trpc/server/router";

const errorCodesToAlertOn = [
  AppErrorCode.UNKNOWN_ERROR,
  "INTERNAL_SERVER_ERROR",
];

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: async ({ req, res }) =>
    createTrpcContext({ req, res, requestSource: "app" }),
  onError: (opts) => {
    const { error, path } = opts;

    if (!path) return;

    const appError = AppError.parseError(error.cause || error);
    const isAppError = error.cause instanceof AppError;

    const isLoggableError =
      (isAppError && appError.statusCode === 500) ||
      errorCodesToAlertOn.includes(appError.code);

    const isLoggableTrpcError =
      !isAppError && errorCodesToAlertOn.includes(error.code);

    if (isLoggableError || isLoggableTrpcError) {
    }
  },
});
