import { AppError } from "../../errors/app-error";
import { resetPassword as resetPasswordFetcher } from "../../api/users/fetchers";
import type { TRequestMetadata } from "../../universal/extract-request-metadata";

type ResetPasswordParams = {
  password: string;
  token: string;
  requestMetadata: TRequestMetadata;
};

export const resetPassword = async ({
  password,
  token,
  requestMetadata,
}: ResetPasswordParams): Promise<void> => {
  if (!token) {
    throw new AppError("INVALID_TOKEN");
  }
  await resetPasswordFetcher({
    password,
    token,
    ...requestMetadata,
  });
};
