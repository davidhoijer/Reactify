// MainPage.tsx
import React, {useEffect, useRef, useState} from "react";
import {fetchProfile, fetchCurrentSong, redirectToAuthCodeFlow, getAccessToken} from "../api/spotifyApi";
import type {SpotifyUser} from "../types/SpotifyUser";
import type {CurrentSong} from "../types/CurrentSong";
import Box from "@mui/material/Box";
import CurrentSongComponent from "./CurrentSong";

const POLL_INTERVAL = process.env.REACT_APP_POLL_RATE ? parseInt(process.env.REACT_APP_POLL_RATE, 10) : 1000;

const MainPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<SpotifyUser | null>(null);
  const [currentSong, setCurrentSong] = useState<CurrentSong | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef(false);

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
          window.history.replaceState({}, "", window.location.pathname);
        }

        const [profile, song] = await Promise.all([fetchProfile(), fetchCurrentSong()]);
        setUserProfile(profile);
        setCurrentSong(song);
      } catch (e: any) {
        setError(e.message ?? String(e));
      } finally {
        setLoading(false);
      }
    };

    const poll = async () => {
      if (stopRef.current || document.hidden) return;
      try {
        const song = await fetchCurrentSong();
        setCurrentSong(song);
      } catch (e) {
        console.error(e);
      } finally {
        if (!stopRef.current) setTimeout(poll, POLL_INTERVAL);
      }
    };

    const onVis = () => {
      if (!document.hidden) setTimeout(poll, POLL_INTERVAL);
    };
    document.addEventListener("visibilitychange", onVis);

    init().then(() => setTimeout(poll, POLL_INTERVAL));

    return () => {
      stopRef.current = true;
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (loading) return <Box>Loading…</Box>;
  if (error) return <Box>Error: {error}</Box>;
  return <div><CurrentSongComponent userProfile={userProfile} currentSong={currentSong}/></div>;
};

export default MainPage;
