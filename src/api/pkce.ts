export function generateCodeVerifier(length = 128) {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(arr, b => chars[b % chars.length]).join("");
}

export async function generateCodeChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+/g, "");
  return base64;
}
