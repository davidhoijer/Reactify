import React, {useEffect, useRef, useState} from "react";
import {fetchProfile, fetchCurrentSong, redirectToAuthCodeFlow, getAccessToken} from "../api/spotifyApi";
import type {SpotifyUser} from "../types/SpotifyUser";
import type {CurrentSong} from "../types/CurrentSong";
import Box from "@mui/material/Box";
import CurrentSongComponent from "./CurrentSong";

const FAST_MS = 1000;      // spelar
const PAUSED_MS = 7000;    // paus/podcast
const IDLE_MS = 45000;     // inget spelas
const MAX_BACKOFF_MS = 60000;

const MainPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<SpotifyUser | null>(null);
  const [currentSong, setCurrentSong] = useState<CurrentSong | null>(null);
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
    if (!song) return IDLE_MS;
    if (song.currently_playing_type === "track" && song.is_playing) return FAST_MS;
    return PAUSED_MS; // pausad track eller podcast/episode
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
      setCurrentSong(song);

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

        const accessToken = localStorage.getItem("access_token");
        const exp = Number(localStorage.getItem("token_expiry_time") ?? 0);
        const isExpired = !accessToken || Date.now() >= exp;

        if (!accessToken && !code) {
          await redirectToAuthCodeFlow();
          return;
        }

        if (isExpired) {
          if (!code) throw new Error("No code available for fetching access token");
          await getAccessToken(code);
          // snygg URL utan ?code
          window.history.replaceState({}, "", window.location.pathname);
        }

        const [profile, song] = await Promise.all([fetchProfile(), fetchCurrentSong()]);
        setUserProfile(profile);
        setCurrentSong(song);

        // Starta adaptiv polling baserat på nuvarande state
        schedule(nextDelayFor(song));
      } catch (e: any) {
        setError(e.message ?? String(e));
      } finally {
        setLoading(false);
      }
    };

    const onVis = () => {
      if (!document.hidden) {
        // Kicka igång direkt när sidan blir synlig igen
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
    <div>
      <CurrentSongComponent userProfile={userProfile} currentSong={currentSong}/>
    </div>
  );
};

export default MainPage;
