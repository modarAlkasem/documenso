import { z } from "zod";
import { symmetricEncrypt } from "../../universal/crypto";
import { DOCUMENSO_ENCRYPTION_SECONDARY_KEY } from "../../constants/crypto";

export type EncryptDataOptions = {
  data: string;
  expiresAt?: number;
};

export const ZEncryptDataOptionsSchema = z.object({
  data: z.string(),
  expiresAt: z.number().optional(),
});

export const encryptSecondaryData = ({
  data,
  expiresAt,
}: EncryptDataOptions) => {
  if (!DOCUMENSO_ENCRYPTION_SECONDARY_KEY) {
    throw new Error("Missing encryption key");
  }
  return symmetricEncrypt({
    key: DOCUMENSO_ENCRYPTION_SECONDARY_KEY,
    data: JSON.stringify({ data, expiresAt }),
  });
};
