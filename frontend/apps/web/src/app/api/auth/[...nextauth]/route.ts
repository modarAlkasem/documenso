import { NextRequest } from "next/server";

import NextAuth from "next-auth";

import { IS_BILLING_ENABLED } from "@documenso/lib/constants/app";
import { NEXT_AUTH_OPTIONS } from "@documenso/lib/next-auth/auth-options";
import { extractNextRequestMetadata } from "@documenso/lib/universal/extract-request-metadata";
import { slugify } from "@documenso/lib/utils/slugify";
import { createSecurityLog } from "@documenso/lib/api/auth/fetchers";
import {
  getUser,
  updateUser,
  getUserByUniqueField,
} from "@documenso/lib/api/users/fetchers";

import { UserSecurityAuditLogType } from "@documenso/lib/constants/auth";

const auth = async (req: any, ctx: any) => {
  const { ipAddress, userAgent } = extractNextRequestMetadata(req);
  return await NextAuth(req, ctx, {
    ...NEXT_AUTH_OPTIONS,
    pages: {
      signIn: "/signin",
      signOut: "/signout",
      error: "/signin",
    },
    events: {
      signIn: async ({ user: { id: userId } }) => {
        const user = await getUser(userId as number);

        await createSecurityLog({
          userId: userId as number,
          type: UserSecurityAuditLogType.SIGN_IN,
          ipAddress,
          userAgent,
        });
      },
      signOut: async ({ token }) => {
        const userId = Number(token.id);
        if (isNaN(userId)) {
          return;
        }
        await createSecurityLog({
          userId,
          type: UserSecurityAuditLogType.SIGN_IN,
          ipAddress,
          userAgent,
        });
      },
      linkAccount: async ({ account, user, profile }) => {
        const userId = Number(user.id);

        if (account.provider === "oidc" && profile.emailVerified) {
          await updateUser({
            id: userId,
            email_verified: new Date(profile.emailVerified),
          });
        }

        if (
          account.provider === "oidc" &&
          user.name &&
          "url" in user &&
          !user.url
        ) {
          let counter = 1;
          let url = slugify(user.name);

          while (await getUserByUniqueField({ field: "url", value: url })) {
            url = `${slugify(user.name)}-${counter}`;
          }
          await updateUser({
            id: Number(user.id),
            url: url,
          });
        }

        await createSecurityLog({
          userId: Number(user.id),
          type: UserSecurityAuditLogType.ACCOUNT_SSO_LINK,
          ipAddress,
          userAgent,
        });
      },
    },
  });
};

export { auth as GET, auth as POST };
