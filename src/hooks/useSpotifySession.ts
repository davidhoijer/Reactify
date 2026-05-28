import {useEffect, useState} from "react";
import {tokenStore} from "../api/apiClient";
import {
  fetchProfile,
  fetchUserTopArtists,
  getAccessToken,
  redirectToAuthCodeFlow,
  refreshAccessToken,
} from "../api/spotifyApi";
import type {Artist2} from "../types/CurrentSong";
import type {SpotifyUser} from "../types/SpotifyUser";

interface SpotifySessionState {
  userProfile: SpotifyUser | null;
  topArtists: Artist2[] | null;
  loading: boolean;
  error: string | null;
  isReady: boolean;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useSpotifySession(): SpotifySessionState {
  const [userProfile, setUserProfile] = useState<SpotifyUser | null>(null);
  const [topArtists, setTopArtists] = useState<Artist2[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let redirecting = false;

    const initSession = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const bag = tokenStore.read();

        if (!bag && !code) {
          redirecting = true;
          await redirectToAuthCodeFlow();
          return;
        }

        if (!bag && code) {
          await getAccessToken(code);
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } else if (bag && Date.now() >= bag.expiresAt) {
          try {
            await refreshAccessToken(bag.refreshToken);
          } catch (err) {
            console.error("Initial refresh failed:", err);
            tokenStore.clear();
            redirecting = true;
            await redirectToAuthCodeFlow();
            return;
          }
        }

        const [profile, artists] = await Promise.all([
          fetchProfile(),
          fetchUserTopArtists(),
        ]);

        if (cancelled) return;

        setUserProfile(profile);
        setTopArtists(artists);
        setError(null);
        setIsReady(true);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(errorMessage(err));
          setIsReady(false);
        }
      } finally {
        if (!cancelled && !redirecting) {
          setLoading(false);
        }
      }
    };

    initSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    userProfile,
    topArtists,
    loading,
    error,
    isReady,
  };
}
