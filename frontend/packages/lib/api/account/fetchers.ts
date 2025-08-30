import * as JSON from "superjson";

import { API_BASE_URL } from "../../constants/app";
import { JSON_HEADERS, ACCEPT_JSON_HEADER } from "../common-headers";
import { AppError, AppErrorCode } from "../../errors/app-error";
import type {
  GetAccountByProviderAndAccountIdPayload,
  GetAccountByProviderAndAccountIdResponse,
  AccountWithUser,
} from "./types";

export const getAccountByProviderAndAccountId = async ({
  provider_account_id,
  provider,
}: GetAccountByProviderAndAccountIdPayload): Promise<GetAccountByProviderAndAccountIdResponse> => {
  const result = await fetch(
    `${API_BASE_URL()}/accounts/retrieve-by-provider-and-account-id/?provider=${provider}&provider_account_id=${provider_account_id}`,
    {
      headers: ACCEPT_JSON_HEADER,
    }
  );
  if (!result.ok) {
    switch (result.status) {
      case 400:
        throw new Error("Invalid 'provider' or 'provider_account_id");

      default:
        throw new Error("Something went wrong!");
    }
  }

  const json = await result.json();
  return json.data;
};

export const createAccount = async (
  account: AccountWithUser
): Promise<AccountWithUser> => {
  const result = await fetch(`${API_BASE_URL()}/accounts/`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(account),
  });
  const json = await result.json();
  if (!result.ok) {
    switch (result.status) {
      case 400:
        throw new AppError(AppErrorCode.INVALID_BODY);

      default:
        throw new AppError(AppErrorCode.UNKNOWN_ERROR);
    }
  }

  return json.data;
};
