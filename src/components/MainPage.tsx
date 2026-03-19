import React, {useEffect, useRef, useState} from "react";
import {
  fetchProfile,
  fetchCurrentSong,
  redirectToAuthCodeFlow,
  getAccessToken,
  refreshAccessToken, fetchUserTopArtists
} from "../api/spotifyApi";
import type {SpotifyUser} from "../types/SpotifyUser";
import {Artist2, CurrentSong} from "../types/CurrentSong";
import Box from "@mui/material/Box";
import CurrentSongComponent, {PlaybackState} from "./CurrentSong";
import {tokenStore} from "../api/apiClient";

const FAST_POLLRATE_MS = 1000;      // Song is playing
const PAUSED_POLLRATE_MS = 7000;    // Song or podcast is paused
const IDLE_POLLRATE_MS = 45000;     // Nothing is playing
const MAX_BACKOFF_MS = 60000;

function isSameTrack(prev: CurrentSong | null, next: CurrentSong | null): boolean {
  if (prev === next) return true;
  if (!prev || !next) return false;
  return (
    prev.currently_playing_type === next.currently_playing_type &&
    prev.item?.id === next.item?.id &&
    prev.item?.album?.id === next.item?.album?.id &&
    prev.item?.album?.images?.[0]?.url === next.item?.album?.images?.[0]?.url
  );
}

function playbackFromSong(song: CurrentSong | null): PlaybackState | null {
  if (!song) return null;

  return {
    durationMs: song.item?.duration_ms ?? 0,
    progressMs: song.progress_ms ?? 0,
    isPlaying: song.is_playing,
    syncedAt: Date.now(),
  };
}

const MainPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<SpotifyUser | null>(null);
  const [currentSong, setCurrentSong] = useState<CurrentSong | null>(null);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [userTopArtists, setUserTopArtists] = useState<Artist2[] | null>(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stopRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const errorBackoffRef = useRef<number>(0); // i ms

  const clearTimer = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const jitter = (ms: number) => {
    // Liten +/- 10% jitter så vi inte "trommar" exakt varje sekund
    const delta = Math.floor(ms * 0.1);
    const rand = Math.floor(Math.random() * (delta * 2 + 1)) - delta;
    return Math.max(250, ms + rand);
  };

  const nextDelayFor = (song: CurrentSong | null): number => {
    if (!song) return IDLE_POLLRATE_MS;
    if (song.currently_playing_type === "track" && song.is_playing) return FAST_POLLRATE_MS;
    return PAUSED_POLLRATE_MS; // pausad track eller podcast/episode
  };

  const schedule = (ms: number) => {
    if (stopRef.current) return;
    clearTimer();
    timeoutRef.current = window.setTimeout(poll, jitter(ms));
  };

  const poll = async () => {
    if (stopRef.current || document.hidden) return;
    try {
      const song = await fetchCurrentSong();
      setCurrentSong((prev) => (isSameTrack(prev, song) ? prev : song));
      setPlayback(playbackFromSong(song));

      // Nollställ fel-backoff på lyckad hämtning
      errorBackoffRef.current = 0;

      schedule(nextDelayFor(song));
    } catch (e) {
      console.error("Error fetching current song:", e);
      // Exponentiell backoff vid fel
      const prev = errorBackoffRef.current || 2000;
      const next = Math.min(prev * 2, MAX_BACKOFF_MS);
      errorBackoffRef.current = next;
      schedule(next);
    }
  };

  useEffect(() => {
    stopRef.current = false;

    const init = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const bag = tokenStore.read(); // { accessToken, refreshToken, expiresAt } | null

        if (!bag && !code) {
          await redirectToAuthCodeFlow();
          return;
        }

        if (!bag && code) {
          // Första inloggningen (PKCE code exchange)
          await getAccessToken(code);
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } else if (bag) {
          // Har tokens – proaktiv refresh om utgånget
          if (Date.now() >= bag.expiresAt) {
            try {
              const {access_token, expires_in} = await refreshAccessToken(bag.refreshToken);
              tokenStore.writeAccess(access_token, expires_in);
            } catch (err) {
              console.error("Initial refresh failed:", err);
              // Rensa & tvinga ny login (fixar ogiltigt refresh_token / missmatch)
              tokenStore.clear();
              await redirectToAuthCodeFlow();
              return;
            }
          }
        }

        // Nu ska vi ha en giltig access-token – hämta data
        const [profile, song, userTopArtists] = await Promise.all([fetchProfile(), fetchCurrentSong(), fetchUserTopArtists()]);
        setUserProfile(profile);
        setCurrentSong(song);
        setPlayback(playbackFromSong(song));
        setUserTopArtists(userTopArtists);

        // Starta adaptiv polling
        schedule(nextDelayFor(song));
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    };

    const onVis = () => {
      if (!document.hidden) {
        schedule(0);
      } else {
        clearTimer();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    init();

    return () => {
      stopRef.current = true;
      clearTimer();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);


  if (loading) return <Box>Loading…</Box>;
  if (error) return <Box>Error: {error}</Box>;
  return (
    <CurrentSongComponent
      userProfile={userProfile}
      currentSong={currentSong}
      playback={playback}
      topArtists={userTopArtists}
    />
  );
};

export default MainPage;
