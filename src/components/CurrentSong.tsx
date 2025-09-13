import React, {useEffect, useMemo, useRef, useState} from 'react';
import {CurrentSong} from '../types/CurrentSong';
import '../styling/Styling.css';
import Vibrant from "node-vibrant/lib/bundle";
import AlbumComponent from "./AlbumComponent";
import {SpotifyUser} from "../types/SpotifyUser";
import SongProgressComponent from "./SongProgressComponent";

interface CurrentSongProps {
  userProfile: SpotifyUser | null;
  currentSong: CurrentSong | null;
}

const albumColorCache = new Map<string, string>();

const CurrentSongComponent: React.FC<CurrentSongProps> = ({currentSong}) => {
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const imgRef = useRef<HTMLImageElement>(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const isPodcastOrEpisode = currentSong?.currently_playing_type === "episode";

  // Update base state
  useEffect(() => {
    if (!currentSong || isPodcastOrEpisode) return;
    setProgress(currentSong.progress_ms || 0);
    setDuration(currentSong.item?.duration_ms || 0);
    setIsPlaying(currentSong.is_playing);
  }, [currentSong, isPodcastOrEpisode]);


  // Get background colour, and cache for same album
  useEffect(() => {
    if (isPodcastOrEpisode || !currentSong?.item?.album?.images?.length) return;
    const albumId = currentSong?.item.album.id;
    if (!albumId) return

    const images = currentSong.item.album.images;
    const smallestImageUrl = images[images.length - 1]?.url || images[0]?.url;

    if (albumColorCache.has(albumId)) {
      setBackgroundColor(albumColorCache.get(albumId)!);
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        const vibrant = new Vibrant(smallestImageUrl, {quality: 1});
        const palette = await vibrant.getPalette();
        const dominantColor = palette.Vibrant?.hex || '#ffffff';
        if (!cancelled) {
          albumColorCache.set(albumId, dominantColor);
          setBackgroundColor(dominantColor);
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
  }, [isPodcastOrEpisode, currentSong?.item?.album?.images]);


  const formatTime = useMemo(() => (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, []);

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  useEffect(() => {
    if (!isPlaying || duration <= 0) return;
    let raf = 0;
    const start = performance.now();
    const base = progress;
    const step = (t: number) => {
      const elapsed = t - start;
      const next = Math.min(base + elapsed, duration);
      setProgress(p => (p !== next ? next : p));
      if (next < duration) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, duration]); // medvetet utan `progress`

  return (
    <div className="current-song-ui" style={{backgroundColor}}>

      {isPodcastOrEpisode && (
        <div>
          <div className="podcast-info">
            <h2 className="podcast-title">A Podcast is Currently Playing</h2>
            <p className="podcast-message">
              Enjoy your podcast! Details will be displayed here once available.
            </p>
          </div>
          <div className="podcast-placeholder">
            <img
              src="/placeholder-podcast.png"
              alt="Podcast Placeholder"
              className="podcast-image"
            />
          </div>
        </div>
      )}


      {currentSong && !isPodcastOrEpisode && (
        <AlbumComponent currentSong={currentSong} imgRef={imgRef}/>
      )}

      {currentSong && !isPodcastOrEpisode && (
        <SongProgressComponent progress={progress} duration={duration} progressPercentage={progressPercentage}
                               formatTime={formatTime}/>
      )}

      {/* <div className="controls">
        <button className="control-button">⏮️</button>
        {currentSong?.is_playing ? (
          <button className="control-button">⏸️</button>
        ) : (
          <button className="control-button">▶️</button>
        )}
        <button className="control-button">⏭️</button>
      </div> */}

    </div>
  );
};

export default CurrentSongComponent;
