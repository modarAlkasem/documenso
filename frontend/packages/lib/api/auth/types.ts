import type { APIResponse } from "../base-types";
import type { EMAIL_VERIFICATION_STATE } from "@documenso/lib/server-only/user/verify-email";
import type { User } from "../users/types";
import { UserSecurityAuditLogType } from "../../constants/auth";

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
  secondary_id: string | null;
  token: string;
  completed: boolean;
  user: number;
  created_at: Date;
  expires_at: Date;
};

export type CreateTokenVerificationTokenResponse = VerificationToken;
export type VerifyTokenPayload = {
  token: string;
  identifier: identifierOptions;
};
export type VerifyTokenResponse = {
  status: (typeof EMAIL_VERIFICATION_STATE)[keyof typeof EMAIL_VERIFICATION_STATE];
  user?: User | null | undefined;
};

export type createSecurityLogPayload = {
  userId: number;
  ipAddress?: string | null;
  userAgent?: string | null;
  type: UserSecurityAuditLogType;
};

export type GetVerificationTokenWithUserResponse = Omit<
  VerificationToken,
  "user"
> & {
  user: User;
};
