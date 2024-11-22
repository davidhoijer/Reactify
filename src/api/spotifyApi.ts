import {SpotifyUser} from "../types/SpotifyUser";
import {CurrentSong} from "../types/CurrentSong";

const clientId = process.env.REACT_APP_CLIENT_ID ?? "";

const redirectToAuthCodeFlow = async () => {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:8080/");
  params.append("scope", "user-read-private user-read-email user-read-currently-playing");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
};

const getAccessToken = async (code: string) => {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:8080/");
  params.append("code_verifier", verifier!);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: params
  });

  if (!result.ok) {
    throw new Error("Failed to get access token");
  }

  const {access_token, refresh_token, expires_in} = await result.json();
  return {accessToken: access_token, refreshToken: refresh_token, expiresIn: expires_in};

};

const refreshAccessToken = async (refreshToken: string) => {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: params
  });

  if (!result.ok) {
    throw new Error("Failed to refresh access token");
  }

  const {access_token, expires_in} = await result.json();

  localStorage.setItem("access_token", access_token);
  localStorage.setItem("token_expiry_time", (new Date().getTime() + expires_in * 1000).toString());

  return access_token;
};

const fetchProfile = async (token: string, refreshToken: string): Promise<SpotifyUser> => {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: {Authorization: `Bearer ${token}`},
  });

  if (result.status === 401 || result.status === 400) {
    const newAccessToken = await refreshAccessToken(refreshToken);
    return fetchProfile(newAccessToken, refreshToken);
  }

  if (!result.ok) {
    throw new Error("Failed to fetch profile");
  }

  return await result.json();
};

const fetchCurrentSong = async (token: string, refreshToken: string): Promise<CurrentSong | null> => {
  const result = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    method: "GET",
    headers: {Authorization: `Bearer ${token}`},
  });

  if (result.status === 401 || result.status === 400) {
    const newAccessToken = await refreshAccessToken(refreshToken);
    return fetchCurrentSong(newAccessToken, refreshToken);
  }

  if (!result.ok) {
    throw new Error("Failed to fetch current song");
  }

  const text = await result.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text);
};

export {fetchProfile, fetchCurrentSong, getAccessToken, refreshAccessToken, redirectToAuthCodeFlow};


function generateCodeVerifier(length: number) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
