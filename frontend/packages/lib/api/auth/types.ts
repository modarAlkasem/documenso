import type { APIResponse } from "../base-types";

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
  created_at: Date;
} & CreateVerificationTokenPayload;

export type CreateTokenVerificationTokenResponse = VerificationToken;
