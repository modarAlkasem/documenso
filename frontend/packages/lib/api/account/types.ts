import type { User } from "../users/types";
import { SUPPORTED_AUTH_PROVIDERS } from "../../next-auth/auth-options";

export type AuthProviderOptions =
  (typeof SUPPORTED_AUTH_PROVIDERS)[keyof typeof SUPPORTED_AUTH_PROVIDERS];

export type Account = {
  id?: string;
  user: number | User;
  type: "oauth" | "credentials";
  provider: AuthProviderOptions;
  provider_account_id?: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: Date | null;
  ext_expires_in?: Date | null;
  token_type?: "bearer" | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
  created_at?: Date;
  updated_at?: Date | null;
};

export type GetAccountByProviderAndAccountIdPayload = {
  provider: AuthProviderOptions;
  provider_account_id: string | number;
};

export type GetAccountByProviderAndAccountIdResponse = Account | null;

export type AccountWithUser = Omit<Account, "user"> & {
  user: User;
};
