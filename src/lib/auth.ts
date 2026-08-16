export const AUTH_COOKIE = "df_auth";

export async function hashPasscode(passcode: string): Promise<string> {
  const data = new TextEncoder().encode(`dynasty-football:${passcode}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
