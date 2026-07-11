import { createHash } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "sotorko_admin_session";

// The session token is a hash of the admin password + a server-only pepper,
// so it can't be forged without knowing the real password, but the raw
// password is never stored in the cookie itself.
function getExpectedToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return createHash("sha256").update(`sotorko_admin_${password}`).digest("hex");
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, getExpectedToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME);
  if (!cookie) return false;
  return cookie.value === getExpectedToken();
}
