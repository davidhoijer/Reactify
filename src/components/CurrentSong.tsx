import React, {useContext, useEffect, useMemo, useState} from 'react';
import {Artist2, CurrentSong} from '../types/CurrentSong';
import '../styling/Styling.css';
import AlbumComponent from "./AlbumComponent";
import {SpotifyUser} from "../types/SpotifyUser";
import SongProgressComponent from "./SongProgressComponent";
import {VibrantContext} from "../contexts/VibrantContext";
import TitleAndArtistComponent from "./TitleAndArtistComponent";
import {ToggleButton} from "@mui/material";
import Box from "@mui/material/Box";
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import PauseCircleOutlinedIcon from '@mui/icons-material/PauseCircleOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';
import PodcastComponent from "./PodcastComponent";
import TopArtists from "./TopArtists";
import {fetchCurrentSong, pauseTrack, playNextTrack, playPreviousTrack, resumeTrack} from "../api/spotifyApi";

export interface PlaybackState {
  durationMs: number;
  progressMs: number;
  isPlaying: boolean;
  syncedAt: number;
}

interface CurrentSongProps {
  userProfile: SpotifyUser | null;
  currentSong: CurrentSong | null;
  playback: PlaybackState | null;
  topArtists: Artist2[] | null;
}

const albumColorCache = new Map<string, string>();

const CurrentSongComponent: React.FC<CurrentSongProps> = ({currentSong, playback, topArtists}) => {
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [topArtistsSelected, setTopArtistsSelected] = useState(false);
  const [actionsSelected, setActionsSelected] = useState(false);
  

  const {vibrantColours, lightVibrant, darkVibrant} = useContext(VibrantContext);

  const isPodcastOrEpisode = currentSong?.currently_playing_type === "episode";
  const albumId = currentSong?.item?.album?.id;
  const smallestImageUrl = useMemo(() => {
    const images = currentSong?.item?.album?.images;
    if (!images?.length) return null;
    return images[images.length - 1]?.url || images[0]?.url;
  }, [currentSong?.item?.album?.images]);


  // Get background colour, and cache for same album
  useEffect(() => {
    if (isPodcastOrEpisode || !albumId || !smallestImageUrl) {
      setBackgroundColor('#323232');
      return;
    }

    if (albumColorCache.has(albumId)) {
      setBackgroundColor(albumColorCache.get(albumId)!);
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        const {mainVibrant: mv} = await vibrantColours(smallestImageUrl);
        if (!cancelled) {
          albumColorCache.set(albumId, mv);
          setBackgroundColor(mv);
        }
      } catch {
        if (!cancelled) setBackgroundColor('#ffffff');
      }
    };
    // Skjut Vibrant till slutet av framkörningen så texten redan hunnit visas
    (window.requestIdleCallback ?? window.setTimeout)(run);

    return () => {
      cancelled = true;
    };
  }, [
    albumId,
    isPodcastOrEpisode,
    smallestImageUrl,
    vibrantColours,
  ]);

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
        <>

          <AlbumComponent currentSong={currentSong}/>

          <Box className="song-info-box"
               style={{
                 backgroundColor: window.innerWidth > 700 ? "transparent" : lightVibrant,
               }}>


            <TitleAndArtistComponent currentSong={currentSong}/>

            {playback && (
              <SongProgressComponent
                duration={playback.durationMs}
                initialProgress={playback.progressMs}
                isPlaying={playback.isPlaying}
                syncedAt={playback.syncedAt}
                formatTime={formatTime}
              />
            )}

            {actionsSelected && (
              <div className="controls">

                <button className="control-button" onClick={async () => 
                  await playPreviousTrack().then(fetchCurrentSong)}> <SkipPreviousOutlinedIcon className="icon-style" htmlColor={darkVibrant}/> </button>

                {playback?.isPlaying ? (
                  <button className="control-button" onClick={async () => await pauseTrack()}> <PauseCircleOutlinedIcon className="icon-style" htmlColor={darkVibrant}/> </button>
                ) : (
                  <button className="control-button" onClick={async () => 
                    await resumeTrack().then(fetchCurrentSong)}> <PlayCircleOutlinedIcon className="icon-style" htmlColor={darkVibrant}/> </button>
                )}

                <button className="control-button" onClick={async () => 
                  await playNextTrack().then(fetchCurrentSong)}> <SkipNextOutlinedIcon className="icon-style" htmlColor={darkVibrant}/> </button>
              </div>
            )}

          </Box>
        </>
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
