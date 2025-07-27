import { useMutation } from "@tanstack/react-query";
import { signUp } from "../../api/auth/fetchers";
import type { SignupPayload } from "../../api/auth/types";
import type { User } from "../../api/users/types";

export const createUser = ({
  name,
  email,
  password,
  signature,
  url,
}: SignupPayload): User | void => {
  const { data, error } = useMutation({
    mutationKey: ["signup"],
    mutationFn: async () =>
      signUp({
        name,
        email,
        password,
        signature,
        url,
      }),
  });

  if (error) throw error;

  return data;
};
