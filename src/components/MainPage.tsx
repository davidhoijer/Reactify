import React, { useEffect, useState } from "react";
import { fetchProfile, fetchCurrentSong, redirectToAuthCodeFlow, getAccessToken } from "../api/spotifyApi";
import { SpotifyUser } from "../types/SpotifyUser";
import { CurrentSong } from "../types/CurrentSong";
import Box from "@mui/material/Box";
import '../styling/Styling.css';
import CurrentSongComponent from "./CurrentSong";

const POLL_INTERVAL = 1000;

const MainPage = () => {
  const [userProfile, setUserProfile] = useState<SpotifyUser | null>(null);
  const [currentSong, setCurrentSong] = useState<CurrentSong | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        let accessToken = localStorage.getItem("access_token");
        let refreshToken = localStorage.getItem("refresh_token");
        const tokenExpiryTime = localStorage.getItem("token_expiry_time");

        // Redirect if there's no access token and no code
        if (!code && (!accessToken || new Date().getTime() >= (tokenExpiryTime ? parseInt(tokenExpiryTime) : 0))) {
          await redirectToAuthCodeFlow();
          return; // Early exit after redirect
        }

        // If access token is expired, get new tokens
        if (!accessToken || new Date().getTime() >= (tokenExpiryTime ? parseInt(tokenExpiryTime) : 0)) {
          if (!code) {
            throw new Error("No code available for fetching access token");
          }

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await getAccessToken(code);
          accessToken = newAccessToken;
          refreshToken = newRefreshToken;

          localStorage.setItem("access_token", newAccessToken);
          localStorage.setItem("refresh_token", newRefreshToken);
          localStorage.setItem("token_expiry_time", (new Date().getTime() + 3600 * 1000).toString()); // Assuming expiresIn is 3600 seconds
        }

        // Fetch the user profile and current song
        const profile = await fetchProfile(accessToken!, refreshToken!);
        const song = await fetchCurrentSong(accessToken!, refreshToken!);

        setUserProfile(profile);
        setCurrentSong(song);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up polling for the current song
    const intervalId = setInterval(async () => {
      try {
        let accessToken = localStorage.getItem("access_token");
        let refreshToken = localStorage.getItem("refresh_token");

        if (accessToken && refreshToken) {
          const song = await fetchCurrentSong(accessToken, refreshToken);
          setCurrentSong(song);
        }
      } catch (err: any) {
        console.error("Error fetching current song:", err);
      }
    }, POLL_INTERVAL);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <Box>Loading...</Box>;
  if (error) return <Box>Error: {error}</Box>;

  return (
    <div>
      <CurrentSongComponent userProfile={userProfile} currentSong={currentSong}/>
    </div>
  );
};


export default MainPage;
