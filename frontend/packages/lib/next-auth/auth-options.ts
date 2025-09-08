/// <reference types="../types/next-auth.d.ts" />

import type { AuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { type GoogleProfile } from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AppError, AppErrorCode } from "../errors/app-error";

import { decryptSecondaryData } from "../server-only/crypto/decrypt";
import {
  createAccount,
  getAccountByProviderAndAccountId,
} from "../api/account/fetchers";

import type { JWT } from "next-auth/jwt";

import { env } from "next-runtime-env";
import { DateTime } from "luxon";

import {
  getUser,
  getUserByUniqueField,
  updateUser,
} from "../api/users/fetchers";
import { User } from "../api/users/types";
import { formatSecureCookieName, useSecureCookies } from "../constants/auth";
import { AuthProviderOptions } from "../api/account/types";
import { ErrorCode } from "./error-codes";
import { extractNextRequestMetadata } from "../universal/extract-request-metadata";
import { getVerificationTokens, signIn } from "../api/auth/fetchers";
import { jobsClient } from "../jobs/client";

export const SUPPORTED_AUTH_PROVIDERS = {
  GOOGLE: "google",
  MANUAL: "manual",
} as const;

export const NEXT_AUTH_OPTIONS: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider<GoogleProfile>({
      clientId: env("NEXT_PRIVATE_GOOGLE_CLIENT_ID") ?? "",
      clientSecret: env("NEXT_PRIVATE_GOOGLE_SECRET_KEY") ?? "",
      async profile(profile) {
        const user = await getUserByUniqueField({
          field: "email",
          value: profile.email,
        });

        let id = null;
        if (user && user.id !== Number(profile.sub)) {
          id = user.id as number;
        } else {
          id = Number(profile.sub);
        }
        return {
          id: id,
          name:
            profile.name ||
            `${profile.given_name} ${profile.family_name}`.trim(),
          email: profile.email,
          emailVerified: profile.email_verified
            ? new Date().toISOString()
            : null,
        };
      },
    }),

    CredentialsProvider({
      id: "manual",
      name: "Manual",
      credentials: {
        credential: { label: "Credential", type: "credential" },
      },
      async authorize(credentials, req) {
        const credential = credentials?.credential;

        if (typeof credential !== "string" || credential?.length === 0)
          throw new AppError(AppErrorCode.INVALID_REQUEST);

        const decryptedCredential = decryptSecondaryData(credential);

        if (!decryptedCredential)
          throw new AppError(AppErrorCode.INVALID_REQUEST);

        const parsedCredential = JSON.parse(decryptedCredential.data);

        if (typeof parsedCredential !== "object" || parsedCredential === null)
          throw new AppError(AppErrorCode.INVALID_REQUEST);

        const { userId, email } = parsedCredential;

        if (typeof userId !== "number" || typeof email !== "string") {
          throw new AppError(AppErrorCode.INVALID_REQUEST);
        }

        const user = await getUser(userId);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified ?? null,
        };
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: {
          label: "Two factor code",
          type: "text",
          placeholder: "Code from authenticator app",
        },
        backupCode: {
          label: "Backup Code",
          type: "text",
          placeholder: "Two-factor backup code",
        },
      },
      authorize: async (credentials, req) => {
        if (!credentials) {
          throw new Error(ErrorCode.CREDENTIALS_NOT_FOUND);
        }
        const { email, password, totp, backupCode } = credentials;
        const { ipAddress, userAgent } = extractNextRequestMetadata(req);
        const user = await signIn({
          email,
          password,
          totp,
          backup_code: backupCode,
          ip_address: ipAddress,
          user_agent: userAgent,
        }).catch(async (err) => {
          const result = await getVerificationTokens({
            searchParams: {
              user_email: email,
              created_at: "last",
            },
          });

          if (
            (err.message === ErrorCode.UNVERIFIED_EMAIL &&
              result.length == 0) ||
            new Date(result[0].expires_at) < new Date() ||
            DateTime.fromISO(result[0].created_at).diffNow("minutes").minutes >
              -5
          ) {
            jobsClient.triggerJob({
              name: "send.signup.confirmation.email",
              payload: {
                email: email,
              },
            });
          }

          if (err.message == ErrorCode.INCORRECT_PASSWORD) {
            err.message = ErrorCode.INCORRECT_EMAIL_PASSWORD;
          }
          throw err;
        });

        return {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          emailVerified: user?.email_verified ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ user, token, account, profile, trigger }) {
      const merged = {
        ...token,
        ...user,
        emailVerified: user?.emailVerified
          ? new Date(user?.emailVerified).toISOString()
          : null,
      };

      if (!merged.email || typeof merged.emailVerified !== "string") {
        const userId = Number(merged.id ?? merged.sub);
        try {
          const retrieved = await getUser(userId);
          merged.id = retrieved.id as number;
          merged.email = retrieved.email;
          merged.name = retrieved.name;
          merged.emailVerified = retrieved.email_verified ?? null;
        } catch (e) {
          return token;
        }
      }
      if (
        merged.id &&
        (!merged.lastSignedIn ||
          DateTime.fromISO(merged.lastSignedIn).plus({ hour: 1 }) <=
            DateTime.now())
      ) {
        const updateUserOptions = {
          id: Number(merged.id),
          lastSignedIn: new Date(),
        };

        const user = await updateUser(updateUserOptions);

        merged.lastSignedIn = updateUserOptions.lastSignedIn.toISOString();
        merged.emailVerified = user.email_verified as unknown as string;
      }

      if (
        trigger === "signIn" ||
        (trigger === "signUp" &&
          account?.provider === SUPPORTED_AUTH_PROVIDERS.GOOGLE)
      ) {
        merged.emailVerified = user.emailVerified
          ? new Date(user.emailVerified).toISOString()
          : new Date().toISOString();

        const updateUserOptions = {
          id: Number(merged.id),
          email_verified: new Date().toISOString(),
          identity: "GOOGLE",
        };

        await updateUser(updateUserOptions);
      }

      return {
        id: merged.id as number,
        email: merged.email,
        name: merged.name,
        lastSignedIn: merged.lastSignedIn,
        emailVerified: merged.emailVerified,
      } satisfies JWT;
    },
    session({ token, session }) {
      if (token && token.email) {
        return {
          ...session,
          user: {
            id: Number(token.id),
            email: token.email,
            name: token.name ?? "",
            emailVerified: token.emailVerified ?? null,
          },
        } satisfies Session;
      }
      return session;
    },
    async signIn({ user, account }) {
      let result = true;
      if (env("NEXT_PRIVATE_OIDC_ALLOW_SIGNUP") === "false") {
        result = false;
      }

      if (env("NEXT_PUBLIC_DISABLE_SIGNUP") === "true") {
        const userData = await getUserByUniqueField({
          field: "email",
          value: user.email!,
        });

        result = !!userData;
      }

      if (
        account?.provider &&
        Object.values(SUPPORTED_AUTH_PROVIDERS).includes(
          account?.provider as AuthProviderOptions
        ) &&
        result
      ) {
        const retrievedAccount = await getAccountByProviderAndAccountId({
          provider: (account?.provider as AuthProviderOptions) ?? "manual",
          provider_account_id:
            account?.providerAccountId || (user.id as number),
        });

        if (!retrievedAccount && result) {
          await createAccount({
            provider: account.provider as AuthProviderOptions,
            provider_account_id: account.providerAccountId,
            type: "oauth",
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            id_token: account.id_token,
            scope: account.scope,
            expires_at: account.expires_at
              ? new Date(account.expires_at)
              : null,
            session_state: account.session_state,
            user: {
              name: user.name ?? "",
              email: user.email ?? "",
            },
          });
        }
      }

      return result;
    },
  },
  cookies: {
    sessionToken: {
      name: formatSecureCookieName("next-auth.session-token"),
      options: {
        httpOnly: true,
        sameSite: useSecureCookies ? "none" : "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: formatSecureCookieName("next-auth.callback-url"),
      options: {
        sameSite: useSecureCookies ? "none" : "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: formatSecureCookieName("next-auth.csrf-token"),
      options: {
        httpOnly: true,
        sameSite: useSecureCookies ? "none" : "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    pkceCodeVerifier: {
      name: formatSecureCookieName("next-auth.pkce.code_verifier"),
      options: {
        httpOnly: true,
        sameSite: useSecureCookies ? "none" : "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    state: {
      name: formatSecureCookieName("next-auth.state"),
      options: {
        httpOnly: true,
        sameSite: useSecureCookies ? "none" : "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
};
