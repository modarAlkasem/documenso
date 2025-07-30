import { UserWithVerificationToken } from "./types";
import { API_BASE_URL } from "../../constants/app";
import { ACCEPT_JSON_HEADER } from "../common-headers";

export const getUserWithVerificationToken = async (
  userId: number
): Promise<UserWithVerificationToken> => {
  const result = await fetch(
    `${API_BASE_URL}/users/${userId}/with-recent-token/`,
    {
      headers: ACCEPT_JSON_HEADER,
    }
  );
  if (!result.ok) {
    switch (result.status) {
      case 404:
        throw new Error("There is no user with given \'userId\'");

      default:
        throw new Error("Something went wrong!");
    }
  }

  const json = await result.json();
  return json.data;
};
