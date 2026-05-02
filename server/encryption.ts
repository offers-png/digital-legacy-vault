import crypto from "crypto";

/**
 * Encryption utilities for Digital Legacy Vault
 * Implements hybrid encryption: user password-derived key + executor key escrow
 */

const ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_DIGEST = "sha256";

/**
 * Derive a key from a password using PBKDF2
 */
export function deriveKeyFromPassword(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, PBKDF2_DIGEST);
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * Generate a random IV for encryption
 */
export function generateIv(): Buffer {
  return crypto.randomBytes(IV_LENGTH);
}

/**
 * Generate a random master key for asset encryption
 */
export function generateMasterKey(): Buffer {
  return crypto.randomBytes(32);
}

/**
 * Encrypt the master key with a password-derived key
 * Returns: { encryptedKey, iv, salt, authTag }
 */
export function encryptMasterKey(
  masterKey: Buffer,
  password: string
): {
  encryptedKey: string;
  iv: string;
  salt: string;
  authTag: string;
} {
  const salt = generateSalt();
  const iv = generateIv();
  const derivedKey = deriveKeyFromPassword(password, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  let encrypted = cipher.update(masterKey);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedKey: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    salt: salt.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypt the master key with a password
 */
export function decryptMasterKey(
  encryptedKey: string,
  password: string,
  iv: string,
  salt: string,
  authTag: string
): Buffer {
  const derivedKey = deriveKeyFromPassword(password, Buffer.from(salt, "hex"));
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    derivedKey,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(Buffer.from(encryptedKey, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}

/**
 * Encrypt asset data with the master key
 * Returns: { encryptedData, iv, authTag }
 */
export function encryptAssetData(
  data: string,
  masterKey: Buffer
): {
  encryptedData: string;
  iv: string;
  authTag: string;
} {
  const iv = generateIv();
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);
  let encrypted = cipher.update(data, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypt asset data with the master key
 */
export function decryptAssetData(
  encryptedData: string,
  masterKey: Buffer,
  iv: string,
  authTag: string
): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    masterKey,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(Buffer.from(encryptedData, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

/**
 * Encrypt executor's copy of the master key with executor's public key
 * For now, we'll use a simple approach: encrypt with a derived key from executor's ID
 * In production, this should use RSA or similar asymmetric encryption
 */
export function encryptExecutorKey(
  masterKey: Buffer,
  executorId: number
): {
  encryptedKey: string;
  iv: string;
  authTag: string;
} {
  const iv = generateIv();
  // Derive a key from executor ID (in production, use executor's actual public key)
  const executorKey = crypto.createHash("sha256").update(`executor-${executorId}`).digest();

  const cipher = crypto.createCipheriv(ALGORITHM, executorKey, iv);
  let encrypted = cipher.update(masterKey);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedKey: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypt executor's copy of the master key
 */
export function decryptExecutorKey(
  encryptedKey: string,
  executorId: number,
  iv: string,
  authTag: string
): Buffer {
  const executorKey = crypto.createHash("sha256").update(`executor-${executorId}`).digest();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    executorKey,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(Buffer.from(encryptedKey, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}

/**
 * Generate a secure random token for executor invitations
 */
export function generateInvitationToken(): string {
  return crypto.randomBytes(64).toString("hex");
}
