import type { User as DjangoUser } from "../api/users/types";
import type { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: User;
  }

  interface User extends Omit<DefaultUser, "id" | "image" | "email_verified"> {
    id: DjangoUser["id"];
    name?: DjangoUser["name"];
    email?: DjangoUser["email"];
    emailVerified?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string | number;
    name?: string | null;
    email: string | null;
    emailVerified?: string | null;
    lastSignedIn?: string | null;
  }
}
