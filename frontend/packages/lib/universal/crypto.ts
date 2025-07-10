import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils";
import { sha256 } from "@noble/hashes/sha2";
import { managedNonce } from "@noble/ciphers/webcrypto";
import { xchacha20poly1305 } from "@noble/ciphers/chacha";

export type SymmetricEncryptOptions = {
  data: string;
  key: string;
};

export const symmetricEncrypt = ({ key, data }: SymmetricEncryptOptions) => {
  const keyAsBytes = sha256(key);
  const dataAsBytes = utf8ToBytes(data);
  const chacha = managedNonce(xchacha20poly1305)(keyAsBytes);
  return bytesToHex(chacha.encrypt(dataAsBytes));
};

export type SymmetricDecryptOptions = {
  data: string;
  key: string;
};

export const symmetricDecrypt = ({ key, data }: SymmetricDecryptOptions) => {
  const keyToBytes = sha256(key);
  const dataToBytes = utf8ToBytes(data);
  const chacha = managedNonce(xchacha20poly1305)(keyToBytes);
  return chacha.decrypt(dataToBytes);
};
