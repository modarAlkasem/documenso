import { API_BASE_URL } from "../../constants/app";
import { CreateVerificationTokenPayload, VerificationToken } from "./types";

export const create_verification_token = async (
  payload: CreateVerificationTokenPayload
): Promise<VerificationToken> => {
  const result = await fetch(`${API_BASE_URL}/auth/verification-tokens/`);

  if (!result.ok) throw new Error("Something went wrong!");

  return result.json();
};
