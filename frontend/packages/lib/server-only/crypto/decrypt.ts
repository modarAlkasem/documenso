import { DOCUMENSO_ENCRYPTION_SECONDARY_KEY } from "../../constants/crypto";

import { symmetricDecrypt } from "../../universal/crypto";
import { ZEncryptDataOptionsSchema } from "./encrypt";

export const decryptSecondaryData = (encryptedData: string) => {
  if (!DOCUMENSO_ENCRYPTION_SECONDARY_KEY) {
    throw new Error("Missing encryption key");
  }
  try {
    const decryptedBufferValue = symmetricDecrypt({
      data: encryptedData,
      key: DOCUMENSO_ENCRYPTION_SECONDARY_KEY,
    });
    const decryptedValue = Buffer.from(decryptedBufferValue).toString("utf-8");
    const result = ZEncryptDataOptionsSchema.safeParse(
      JSON.parse(decryptedValue)
    );

    if (!result.success) return null;

    if (
      result.data.expiresAt !== undefined &&
      result.data.expiresAt < Date.now()
    )
      return null;

    return result.data.data;
  } catch {
    return null;
  }
};
