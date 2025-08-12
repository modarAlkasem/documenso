import type { APIResponse } from "../base-types";
import type { EMAIL_VERIFICATION_STATE } from "@documenso/lib/server-only/user/verify-email";
import type { User } from "../users/types";

export type identifierOptions = "PASSKEY_CHALLENGE" | "confirmation-email";

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  signature?: string | undefined | null;
  url?: string | null;
};

export type CreateVerificationTokenPayload = {
  identifier: identifierOptions;
  email: string;
  expires_at: Date;
  force: boolean;
};

export type VerificationToken = {
  id: number;
  secondary_id: string;
  token: string;
  completed: boolean;
  user: number;
  created_at: Date;
} & CreateVerificationTokenPayload;

export type CreateTokenVerificationTokenResponse = VerificationToken;
export type VerifyTokenPayload = {
  token: string;
  identifier: identifierOptions;
};
export type VerifyTokenResponse = {
  status: (typeof EMAIL_VERIFICATION_STATE)[keyof typeof EMAIL_VERIFICATION_STATE];
  user?: User | null | undefined;
};
