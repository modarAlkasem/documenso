import { API_BASE_URL } from "../../constants/app";
import type {
  CreateVerificationTokenPayload,
  VerificationToken,
  SignupPayload,
  VerifyTokenPayload,
  VerifyTokenResponse,
  createSecurityLogPayload,
  GetVerificationTokenWithUserResponse,
  SignInPayload,
  GetVerificationTokensSearchOptions,
} from "./types";
import { JSON_HEADERS, ACCEPT_JSON_HEADER } from "../common-headers";
import * as JSON from "superjson";
import type { User } from "../users/types";
import { AppError, AppErrorCode } from "../../errors/app-error";

export const signUp = async (payload: SignupPayload): Promise<User> => {
  const result = await fetch(`${API_BASE_URL()}/auth/signup/`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  if (!result.ok) throw new Error("Something went wrong!");

  const json = await result.json();
  return json.data;
};

export const createVerificationToken = async (
  payload: CreateVerificationTokenPayload
): Promise<VerificationToken> => {
  const result = await fetch(`${API_BASE_URL()}/auth/verification-tokens/`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  const json = await result.json();
  if (!result.ok) {
    switch (result.status) {
      case 400:
        if (json.errors && typeof json.errors === "object" && json.errors.url)
          throw new AppError(AppErrorCode.ALREADY_EXISTS, {
            message: "Profile username is taken",
            userMessage: "The Profile username is already taken",
          });

        throw new AppError(AppErrorCode.ALREADY_EXISTS);
    }
  }

  return json.data;
};

export const verifyToken = async ({
  token,
  identifier,
}: VerifyTokenPayload): Promise<VerifyTokenResponse> => {
  const result = await fetch(
    `${API_BASE_URL()}/auth/verification-tokens/verify/`,
    {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ token, identifier }),
    }
  );
  if (!result.ok)
    throw new Error(
      "Something went wrong while verifying your email.Please try again."
    );
  const json = await result.json();
  return json.data;
};

export const createSecurityLog = async ({
  userId,
  type,
  ipAddress,
  userAgent,
}: createSecurityLogPayload): Promise<void> => {
  const result = await fetch(`${API_BASE_URL()}/auth/security-logs/`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ userId, type, ipAddress, userAgent }),
  });

  if (!result.ok) throw new Error("Something went wrong.");
};

export const signIn = async ({
  email,
  password,
  user_agent,
  ip_address,
}: SignInPayload): Promise<User> => {
  const result = await fetch(`${API_BASE_URL()}/auth/signin/`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      email,
      password,
      user_agent,
      ip_address,
    }),
  });

  const jsonResult = await result.json();

  if (!result.ok) {
    throw new Error(jsonResult.status_text);
  }

  return jsonResult.data;
};

export const getVerificationTokens = async ({
  searchParams,
}: GetVerificationTokensSearchOptions): Promise<
  Array<GetVerificationTokenWithUserResponse>
> => {
  const params = new URLSearchParams({
    ...searchParams,
  });

  const result = await fetch(
    `${API_BASE_URL()}/auth/verification-tokens/?${params.toString()}`,
    {
      headers: ACCEPT_JSON_HEADER,
    }
  );

  if (!result.ok) {
    throw new Error("Something went wrong!");
  }

  const json = await result.json();
  return json.data;
};
