import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Artist2, CurrentSong} from '../types/CurrentSong';
import '../styling/Styling.css';
import AlbumComponent from "./AlbumComponent";
import {SpotifyUser} from "../types/SpotifyUser";
import SongProgressComponent from "./SongProgressComponent";
import {VibrantContext} from "../contexts/VibrantContext";
import TitleAndArtistComponent from "./TitleAndArtistComponent";
import {Button, Snackbar, ToggleButton} from "@mui/material";
import Box from "@mui/material/Box";
import PodcastComponent from "./PodcastComponent";
import TopArtists from "./TopArtists";

interface CurrentSongProps {
  userProfile: SpotifyUser | null;
  currentSong: CurrentSong | null;
  topArtists: Artist2[] | null;
}

const albumColorCache = new Map<string, string>();

const CurrentSongComponent: React.FC<CurrentSongProps> = ({currentSong, topArtists}) => {
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const imgRef = useRef<HTMLImageElement>(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [topArtistsSelected, setTopArtistsSelected] = useState(false);

  const {vibrantColours, lightVibrant} = useContext(VibrantContext);

  const isPodcastOrEpisode = currentSong?.currently_playing_type === "episode";

  // Update base state
  useEffect(() => {
    if (!currentSong || isPodcastOrEpisode) return;
    setProgress(currentSong.progress_ms || 0);
    setDuration(currentSong.item?.duration_ms || 0);
    setIsPlaying(currentSong.is_playing);
  }, [currentSong, isPodcastOrEpisode]);
  const albumId = currentSong?.item?.album?.id;


  // Get background colour, and cache for same album
  useEffect(() => {
    if (isPodcastOrEpisode || !albumId || !currentSong?.item?.album?.images?.length) {
      setBackgroundColor('#323232');
      return;
    }

    const images = currentSong.item.album.images;
    const smallestImageUrl = images[images.length - 1]?.url || images[0]?.url;

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
    currentSong?.item?.album?.images
  ]);

  const formatTime = useMemo(() => (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, []);

  // Update progress every second if the song is playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prevProgress => {
          return Math.min(prevProgress + 1000, duration);
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <Box className="current-song-ui" style={{backgroundColor}}>
      {isPodcastOrEpisode && (
        <PodcastComponent/>
      )}

      {currentSong && !isPodcastOrEpisode && !topArtistsSelected && (
        <>

          <AlbumComponent currentSong={currentSong} imgRef={imgRef}/>

          <Box className="song-info-box"
               style={{
                 width: imgRef.current?.width,
                 height: window.innerWidth > 700 ? imgRef.current?.height : undefined,
                 backgroundColor: window.innerWidth > 700 ? "transparent" : lightVibrant,
               }}>


            <TitleAndArtistComponent currentSong={currentSong}/>

            <SongProgressComponent
              progress={progress}
              duration={duration}
              progressPercentage={progressPercentage}
              formatTime={formatTime}/>

            {/*<div className="controls">*/}
            {/*  */}
            {/*  <button className="control-button" onClick={() => setSnackbarOpen(true)} >⏮️</button>*/}
            {/*  */}
            {/*  {currentSong?.is_playing ? (*/}
            {/*    <button className="control-button" onClick={() => setSnackbarOpen(true)}>⏸️</button>*/}
            {/*  ) : (*/}
            {/*    <button className="control-button" onClick={() => setSnackbarOpen(true)}>▶️</button>*/}
            {/*  )}*/}
            {/*  */}
            {/*  <button className="control-button" onClick={() => setSnackbarOpen(true)}>⏭️</button>*/}
            {/*</div>*/}
          </Box>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={2000}
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            color={lightVibrant}
            onClose={() => setSnackbarOpen(false)}
            message="no redy jet"
          />
        </>
      )}

      <ToggleButton   
        value="top-artists"
        sx={{position: 'fixed', right: '1rem', bottom: '1rem'}}
        selected={topArtistsSelected}
        onChange={() => setTopArtistsSelected((topArtistsSelected) => !topArtistsSelected)}>
        Top 5 artists
      </ToggleButton>


      {topArtistsSelected && (
        <TopArtists topArtists={topArtists}></TopArtists>
      )}
      
      
    </Box>
  );
};

export default CurrentSongComponent;
