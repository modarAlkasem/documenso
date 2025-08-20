export const useSecureCookies =
  process.env.NODE_ENV === "production" &&
  String(process.env.NEXTAUTH_URL).startsWith("https://");

const secureCookiePrefix = useSecureCookies ? "__Secure-" : "";

export const formatSecureCookieName = (name: string) =>
  `${secureCookiePrefix}${name}`;

export enum UserSecurityAuditLogType {
  "ACCOUNT_PROFILE_UPDATE" = "ACCOUNT_PROFILE_UPDATE",
  "ACCOUNT_SSO_LINK" = "ACCOUNT_SSO_LINK",
  "AUTH_2FA_DISABLE" = "AUTH_2FA_DISABLE",
  "AUTH_2FA_ENABLE" = "AUTH_2FA_ENABLE",
  "PASSKEY_CREATED" = "PASSKEY_CREATED",
  "PASSKEY_DELETED" = "PASSKEY_DELETED",
  "PASSKEY_UPDATED" = "PASSKEY_UPDATED",
  "PASSWORD_RESET" = "PASSWORD_RESET",
  "PASSWORD_UPDATE" = "PASSWORD_UPDATE",
  "SIGN_OUT" = "SIGN_OUT",
  "SIGN_IN" = "SIGN_IN",
  "SIGN_IN_FAIL" = "SIGN_IN_FAIL",
  "SIGN_IN_2FA_FAIL" = "SIGN_IN_2FA_FAIL",
  "SIGN_IN_PASSKEY_FAIL" = "SIGN_IN_PASSKEY_FAIL",
}
