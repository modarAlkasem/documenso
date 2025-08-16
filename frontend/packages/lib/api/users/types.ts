import { VerificationToken } from "../auth/types";

export type UserRole = "USER" | "ADMIN";
export type UserIdentityProvider = "DOCUMENSO" | "GOOGLE" | "OIDC";

export type User = {
  id: number;
  name: string;
  customer_id?: string | null;
  email: string;
  email_verified: Date;
  password: string;
  source?: string | null;
  signature?: string | null;
  last_signed_in: Date;
  roles: UserRole[];
  identity_provider: UserIdentityProvider;
  disabled: boolean;
  url?: string | null;
};

export type UserWithVerificationToken = User & {
  verification_token: VerificationToken;
};

export type UpdateUserPayload = Partial<Omit<User, "id">> & { id: number };
