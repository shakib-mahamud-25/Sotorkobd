/**
 * Produces a coarse, non-identifying fingerprint used ONLY to detect
 * abusive submission patterns (e.g. one device spamming many reports).
 * This is NOT used to identify a person, tie reports to an identity, or
 * track users across sessions for any purpose other than abuse detection.
 *
 * It combines a few stable browser signals into a hash. It is intentionally
 * coarse — it will match many devices of the same model/browser/locale
 * combination, which is fine: it's a rate-limit signal, not a unique ID.
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "server";

  const signals = [
    navigator.userAgent,
    navigator.language,
    String(screen.colorDepth),
    `${screen.width}x${screen.height}`,
    new Date().getTimezoneOffset(),
  ].join("|");

  const encoder = new TextEncoder();
  const data = encoder.encode(signals);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
