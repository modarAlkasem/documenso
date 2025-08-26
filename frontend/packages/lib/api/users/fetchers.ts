import { UserWithVerificationToken } from "./types";
import { API_BASE_URL } from "../../constants/app";
import { ACCEPT_JSON_HEADER, JSON_HEADERS } from "../common-headers";
import { AppError, AppErrorCode } from "../../errors/app-error";
import type {
  User,
  UpdateUserPayload,
  GetUserByUniqueFieldPayload,
} from "./types";

export const getUser = async (userId: number): Promise<User> => {
  const result = await fetch(`${API_BASE_URL()}/users/${userId}/`);

  if (!result.ok) throw new AppError(AppErrorCode.INVALID_REQUEST);

  const json = await result.json();
  return json.data;
};

export const getUserWithVerificationToken = async (
  userId: number
): Promise<UserWithVerificationToken> => {
  const result = await fetch(
    `${API_BASE_URL()}/users/${userId}/with-recent-token/`,
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
  return json.data.data;
};

export const updateUser = async ({
  id,
  ...data
}: UpdateUserPayload): Promise<User> => {
  const result = await fetch(`${API_BASE_URL()}/users/unauth/`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });

  const json = await result.json();
  const status = result.status;
  switch (true) {
    case status === 400:
      throw new AppError(AppErrorCode.INVALID_REQUEST);

    case status >= 500:
      throw new AppError(AppErrorCode.UNKNOWN_ERROR);
  }

  return json.data.data;
};

export const getUserByUniqueField = async ({
  field,
  value,
}: GetUserByUniqueFieldPayload): Promise<User> => {
  const result = await fetch(
    `${API_BASE_URL()}/users/retrieve-by-email/?field=${field}&value=${value}`,
    {
      headers: ACCEPT_JSON_HEADER,
    }
  );
  if (!result.ok) {
    switch (result.status) {
      case 404:
        throw new Error(`There is no user with given \'${field}\'`);

      case 400:
        throw new Error(`Invalid or missing search params.`);

      default:
        throw new Error("Something went wrong!");
    }
  }

  const json = await result.json();
  return json.data.data;
};
