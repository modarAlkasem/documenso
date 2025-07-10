import { env } from "next-runtime-env";

export const DOCUMENSO_ENCRYPTION_SECONDARY_KEY = env(
  "NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY"
);
