import { API_BASE_URL } from "../../constants/app";
import { CreateVerificationTokenPayload, VerificationToken } from "./types";
import { JSON_HEADERS } from "../common-headers";
import * as JSON from "superjson";

export const createVerificationToken = async (
  payload: CreateVerificationTokenPayload
): Promise<VerificationToken> => {
  const result = await fetch(`${API_BASE_URL}/auth/verification-tokens/`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  if (!result.ok) throw new Error("Something went wrong!");

  const json = await result.json();
  return json.data;
};
