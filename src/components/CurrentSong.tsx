import React, {useContext, useMemo, useState} from 'react';
import {Artist2, CurrentSong} from '../types/CurrentSong';
import '../styling/Styling.css';
import {VibrantContext} from "../contexts/VibrantContext";
import {ToggleButton} from "@mui/material";
import Box from "@mui/material/Box";
import PodcastComponent from "./PodcastComponent";
import TopArtists from "./TopArtists";
import {useIsWideViewport} from "../hooks/useIsWideViewport";
import {useAlbumVibrantPalette} from "../hooks/useAlbumVibrantPalette";
import TrackPlayback from "./TrackPlayback";
import type {PlaybackState} from "../types/PlaybackState";

interface CurrentSongProps {
  currentSong: CurrentSong | null;
  playback: PlaybackState | null;
  refreshPlayback: () => Promise<void>;
  topArtists: Artist2[] | null;
}

const CurrentSongComponent: React.FC<CurrentSongProps> = ({currentSong, playback, refreshPlayback, topArtists}) => {
  const [topArtistsSelected, setTopArtistsSelected] = useState(false);
  const [actionsSelected, setActionsSelected] = useState(false);

  const {lightVibrant, darkVibrant} = useContext(VibrantContext);
  const backgroundColor = useAlbumVibrantPalette(currentSong);
  const isWideViewport = useIsWideViewport();

  const isPodcastOrEpisode = currentSong?.currently_playing_type === "episode";

  const formatTime = useMemo(() => (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, []);

  return (
    <Box className="current-song-ui" style={{backgroundColor}}>
      {isPodcastOrEpisode && (
        <PodcastComponent/>
      )}

      {currentSong && !isPodcastOrEpisode && !topArtistsSelected && (
        <TrackPlayback
          actionsSelected={actionsSelected}
          controlsColor={darkVibrant}
          currentSong={currentSong}
          formatTime={formatTime}
          isWideViewport={isWideViewport}
          mobilePanelColor={lightVibrant}
          playback={playback}
          refreshPlayback={refreshPlayback}
        />
      )}

      <Box position='fixed'>
        <ToggleButton
          className="toggle-top-artists-button"
          value="top-artists"
          sx={{position: 'fixed', right: '1rem', bottom: '1rem'}}
          selected={topArtistsSelected}
          onChange={() => setTopArtistsSelected((topArtistsSelected) => !topArtistsSelected)}>
          Top 5 artists
        </ToggleButton>

        {!topArtistsSelected && (
          <ToggleButton
            className="toggle-control-button"
            value="actions"
            sx={{position: 'fixed', right: '9rem', bottom: '1rem'}}
            selected={actionsSelected}
            hidden={topArtistsSelected}
            disabled={topArtistsSelected}
            onChange={() => setActionsSelected((actionsSelected) => !actionsSelected)}>
            Controls
          </ToggleButton>
        )}
      </Box>

      {topArtistsSelected && (
        <TopArtists topArtists={topArtists}></TopArtists>
      )}
      
    </Box>
  );
};

export default CurrentSongComponent;
