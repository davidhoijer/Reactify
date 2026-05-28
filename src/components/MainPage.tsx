import React from "react";
import Box from "@mui/material/Box";
import CurrentSongComponent from "./CurrentSong";
import {useCurrentPlaybackPolling} from "../hooks/useCurrentPlaybackPolling";
import {useSpotifySession} from "../hooks/useSpotifySession";

const MainPage: React.FC = () => {
  const session = useSpotifySession();
  const playbackState = useCurrentPlaybackPolling(session.isReady);

  const loading = session.loading || playbackState.loading;
  const error = session.error ?? playbackState.error;

  if (loading) return <Box>Loading…</Box>;
  if (error) return <Box>Error: {error}</Box>;
  return (
    <CurrentSongComponent
      currentSong={playbackState.currentSong}
      playback={playbackState.playback}
      topArtists={session.topArtists}
    />
  );
};

export default MainPage;
