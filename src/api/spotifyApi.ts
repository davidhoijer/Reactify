// spotifyApi.ts
import {CLIENT_ID, REDIRECT_URI, SCOPES} from "./config";
import {generateCodeVerifier, generateCodeChallenge} from "./pkce";
import {spotifyFetch, tokenStore} from "./apiClient";

export async function redirectToAuthCodeFlow() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
    show_dialog: "true",               // <= NYTT: tvinga dialog så vi får refresh_token igen
  });
  document.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// spotifyApi.ts
export async function getAccessToken(code: string) {
  const verifier = localStorage.getItem("verifier");
  if (!code) throw new Error("No code in URL – check REDIRECT_URI and login flow");
  if (!verifier) throw new Error("Missing PKCE verifier – call redirectToAuthCodeFlow() first");

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to get access token (${res.status}): ${txt}`);
  }

  const {access_token, refresh_token, expires_in} = await res.json();

  // Behåll tidigare refresh_token om inget nytt kom
  const existingRt = tokenStore.read()?.refreshToken ?? null;
  const finalRt = refresh_token ?? existingRt;

  if (!finalRt) {
    // Sällsynt men händer: ingen refresh token alls
    // Tipsa användaren att köra om loginflödet helt (clear site data), men vi kan också
    // forcera en ny auth direkt.
    throw new Error("No refresh_token returned. Try a fresh login (we can re-prompt).");
  }

  tokenStore.write({accessToken: access_token, refreshToken: finalRt, expiresIn: expires_in});
  return {accessToken: access_token, refreshToken: finalRt, expiresIn: expires_in};
}


export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID, grant_type: "refresh_token", refresh_token: refreshToken,
  });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST", headers: {"Content-Type": "application/x-www-form-urlencoded"}, body,
  });
  if (!res.ok) throw new Error("Failed to refresh access token");
  const {access_token, expires_in} = await res.json();
  tokenStore.writeAccess(access_token, expires_in);
  return {access_token, expires_in};
}

export async function fetchProfile() {
  const bag = tokenStore.read();
  if (!bag) throw new Error("No token");
  const res = await spotifyFetch("https://api.spotify.com/v1/me", {method: "GET"}, bag, () => refreshAccessToken(bag.refreshToken));
  if (res === null) return null;
  return res.json();
}

export async function fetchCurrentSong() {
  const bag = tokenStore.read();
  if (!bag) throw new Error("No token");
  const res = await spotifyFetch("https://api.spotify.com/v1/me/player/currently-playing", {method: "GET"}, bag, () => refreshAccessToken(bag.refreshToken));
  if (res === null) return null; // inget spelas
  return res.json();
}
