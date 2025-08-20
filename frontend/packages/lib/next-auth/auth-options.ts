/// <reference types="../types/next-auth.d.ts" />

import type { AuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { type GoogleProfile } from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AppError, AppErrorCode } from "../errors/app-error";
import { decryptSecondaryData } from "../server-only/crypto/decrypt";
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

export const NEXT_AUTH_OPTIONS: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider<GoogleProfile>({
      clientId: env("GOOGLE_CLIENT_ID") ?? "",
      clientSecret: env("GOOGLE_SECRET_KEY") ?? "",
      profile(profile) {
        return {
          id: Number(profile.sub),
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

        const parsedCredential = JSON.parse(decryptedCredential);

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
          emailVerified: user.email_verified?.toISOString() ?? null,
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
      } satisfies JWT;

      if (!merged.email || typeof merged.emailVerified !== "string") {
        const userId = Number(merged.id ?? merged.sub);
        try {
          const retrieved = await getUser(userId);
          merged.id = retrieved.id;
          merged.email = retrieved.email;
          merged.name = retrieved.name;
          merged.emailVerified =
            retrieved.email_verified?.toISOString() ?? null;
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
        merged.emailVerified = user.email_verified.toISOString();
      }

      if (
        trigger === "signIn" ||
        (trigger === "signUp" && account?.provider === "google")
      ) {
        merged.emailVerified = user.emailVerified
          ? new Date(user.emailVerified).toISOString()
          : new Date().toISOString();

        const updateUserOptions = {
          id: Number(merged.id),
          email_verified: new Date(),
          identity: "GOOGLE",
        };

        await updateUser(updateUserOptions);
      }
      return {
        id: merged.id,
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
    async signIn({ user }) {
      if (env("NEXT_PRIVATE_OIDC_ALLOW_SIGNUP") === "true") {
        return true;
      }

      if (env("NEXT_PUBLIC_DISABLE_SIGNUP") === "true") {
        const userData = await getUserByUniqueField({
          field: "email",
          value: user.email!,
        });

        return !!userData;
      }

      return true;
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
