import { VerificationToken } from "../auth/types";

export type UserRole = "USER" | "ADMIN";
export type UserIdentityProvider = "DOCUMENSO" | "GOOGLE" | "OIDC";

export type User = {
  id?: number;
  name: string;
  type?: string | null;
  customer_id?: string | null;
  email: string;
  email_verified?: string;
  password?: string | null;
  source?: string | null;
  signature?: string | null;
  last_signed_in?: Date | null;
  roles?: UserRole[];
  identity_provider?: UserIdentityProvider;
  disabled?: boolean;
  url?: string | null;
};

export type UserWithVerificationToken = User & {
  verification_token: VerificationToken;
};

export type UpdateUserPayload = Partial<Omit<User, "id">> & { id: number };

export type GetUserByUniqueFieldPayload = {
  field: "id" | "email" | "url";
  value: number | string;
};
