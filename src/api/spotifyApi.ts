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
  });
  document.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getAccessToken(code: string) {
  const verifier = localStorage.getItem("verifier")!;
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST", headers: {"Content-Type": "application/x-www-form-urlencoded"}, body,
  });
  if (!res.ok) throw new Error("Failed to get access token");
  const {access_token, refresh_token, expires_in} = await res.json();
  tokenStore.write({accessToken: access_token, refreshToken: refresh_token, expiresIn: expires_in});
  return {accessToken: access_token, refreshToken: refresh_token, expiresIn: expires_in};
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
