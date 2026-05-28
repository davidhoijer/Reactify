import {CLIENT_ID, REDIRECT_URI, SCOPES} from "./config";
import {generateCodeVerifier, generateCodeChallenge} from "./pkce";
import {spotifyFetch, tokenStore} from "./apiClient";
import type {Artist2, CurrentSong} from "../types/CurrentSong";
import type {SpotifyUser} from "../types/SpotifyUser";

const ACCOUNTS_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

interface TopArtistsResponse {
  items?: Artist2[];
}

function isInsufficientScopeError(err: unknown) {
  return err instanceof Error && /insufficient/i.test(err.message);
}

async function reauthForScope() {
  tokenStore.clear();
  await redirectToAuthCodeFlow();
}

function readTokenBag() {
  const bag = tokenStore.read();
  if (!bag) throw new Error("No token");
  return bag;
}

async function spotifyRequest(path: string, init: RequestInit): Promise<Response | null> {
  const bag = readTokenBag();

  try {
    return await spotifyFetch(
      `${SPOTIFY_API_BASE_URL}${path}`,
      init,
      bag,
      () => refreshAccessToken(bag.refreshToken),
    );
  } catch (err) {
    if (isInsufficientScopeError(err)) {
      await reauthForScope();
      return null;
    }

    throw err;
  }
}

async function spotifyJson<T>(path: string, init: RequestInit = {method: "GET"}): Promise<T | null> {
  const res = await spotifyRequest(path, init);
  if (res === null) return null;
  return res.json();
}

async function spotifyCommand(path: string, method: "POST" | "PUT"): Promise<Response | null> {
  return spotifyRequest(path, {method});
}

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
    show_dialog: "true",
  });
  document.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getAccessToken(code: string) {
  const verifier = localStorage.getItem("verifier");
  if (!code) throw new Error("No code in URL - check REDIRECT_URI and login flow");
  if (!verifier) throw new Error("Missing PKCE verifier - call redirectToAuthCodeFlow() first");

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch(ACCOUNTS_TOKEN_URL, {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to get access token (${res.status}): ${txt}`);
  }

  const {access_token, refresh_token, expires_in} = await res.json();

  const existingRt = tokenStore.read()?.refreshToken ?? null;
  const finalRt = refresh_token ?? existingRt;

  if (!finalRt) {
    throw new Error("No refresh_token returned. Try a fresh login (we can re-prompt).");
  }

  tokenStore.write({accessToken: access_token, refreshToken: finalRt, expiresIn: expires_in});
  return {accessToken: access_token, refreshToken: finalRt, expiresIn: expires_in};
}


export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID, grant_type: "refresh_token", refresh_token: refreshToken,
  });
  const res = await fetch(ACCOUNTS_TOKEN_URL, {
    method: "POST", headers: {"Content-Type": "application/x-www-form-urlencoded"}, body,
  });
  if (!res.ok) throw new Error("Failed to refresh access token");
  const {access_token, expires_in} = await res.json();
  tokenStore.writeAccess(access_token, expires_in);
  return {access_token, expires_in};
}

export async function fetchProfile(): Promise<SpotifyUser | null> {
  return spotifyJson<SpotifyUser>("/me");
}

export async function fetchCurrentSong(): Promise<CurrentSong | null> {
  return spotifyJson<CurrentSong>("/me/player/currently-playing");
}

export async function fetchUserTopArtists(): Promise<Artist2[] | null> {
  const data = await spotifyJson<TopArtistsResponse>("/me/top/artists?time_range=short_term&limit=5");
  return data && Array.isArray(data.items) ? data.items : null;
}

export async function pauseTrack() {
  return spotifyCommand("/me/player/pause", "PUT");
}

export async function resumeTrack() {
  return spotifyCommand("/me/player/play", "PUT");
}

export async function playNextTrack() {
  return spotifyCommand("/me/player/next", "POST");
}

export async function playPreviousTrack() {
  return spotifyCommand("/me/player/previous", "POST");
}
