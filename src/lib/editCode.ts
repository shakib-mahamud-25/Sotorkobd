import { customAlphabet } from "nanoid";
import { createHash, timingSafeEqual } from "crypto";

// Alphabet excludes visually ambiguous characters (0/O, 1/I/l) so a
// hand-copied or screenshotted code is easy to read back correctly.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const generateRaw = customAlphabet(ALPHABET, 10);

/**
 * Generates a new edit code, e.g. "K7M2-QX9P-4T"
 * Formatted in groups of 4 for readability on the printable receipt.
 */
export function generateEditCode(): string {
  const raw = generateRaw();
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 10)}`;
}

/**
 * Hashes an edit code for storage. We never store the raw code — only
 * this hash — so even a database breach can't expose usable codes.
 */
export function hashEditCode(code: string): string {
  const normalized = code.trim().toUpperCase();
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * Compares a submitted code's hash against the stored hash in constant time.
 * SHA-256 hex digests are always 64 characters, so both buffers are always
 * the same length in the normal case; the length check below only guards
 * against a malformed/corrupted hash reaching this function, and is itself
 * a length comparison (not a value comparison), so it doesn't reintroduce a
 * meaningful timing signal about the code's contents.
 */
export function verifyEditCode(code: string, hash: string): boolean {
  const candidateHash = hashEditCode(code);
  const a = Buffer.from(candidateHash, "utf8");
  const b = Buffer.from(hash, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
