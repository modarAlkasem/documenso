import { signUp } from "../../api/auth/fetchers";
import type { SignupPayload } from "../../api/auth/types";
import type { User } from "../../api/users/types";

export const createUser = async ({
  name,
  email,
  password,
  signature,
  url,
}: SignupPayload): Promise<User> => {
  const user = await signUp({
    name,
    email,
    password,
    signature,
    url,
  });
  return user;
};
