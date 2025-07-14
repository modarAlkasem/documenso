import type { APIResponse } from "../base-types";

export type identifierOptions = "PASSKEY_CHALLENGE" | "confirmation-email";

export type CreateVerificationTokenPayload = {
  identifier: identifierOptions;
  user: string;
  expires_at: Date;
};

export type VerificationToken = {
  id: number;
  secondary_id: string;
  token: string;
  completed: boolean;
  created_at: Date;
} & CreateVerificationTokenPayload;

export type CreateTokenVerificationTokenResponse = VerificationToken;
