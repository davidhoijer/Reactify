import React, { useEffect, useRef, useState } from 'react';
import { CurrentSong } from '../types/CurrentSong';
import '../styling/Styling.css';
import Vibrant from "node-vibrant/lib/bundle";
import AlbumComponent from "./AlbumComponent";
import { SpotifyUser } from "../types/SpotifyUser";
import SongProgressComponent from "./SongProgressComponent";

interface CurrentSongProps {
  userProfile: SpotifyUser | null;
  currentSong: CurrentSong | null;
}

const CurrentSongComponent: React.FC<CurrentSongProps> = ({ userProfile, currentSong }) => {
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const imgRef = useRef<HTMLImageElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Track if the song is playing

  const isPodcastOrEpisode = currentSong?.currently_playing_type === "episode";

  useEffect(() => {

    if (isPodcastOrEpisode) return;

    const extractColor = async (imageUrl: string) => {
      const vibrant = new Vibrant(imageUrl);
      const palette = await vibrant.getPalette();
      const dominantColor = palette.Vibrant?.hex || '#ffffff';
      setBackgroundColor(dominantColor);
    };

    if (currentSong && currentSong?.item.album.images.length > 0) {
      setProgress(currentSong.progress_ms || 0);
      setDuration(currentSong.item.duration_ms || 0);
      setIsPlaying(currentSong.is_playing);

      const imgUrl = currentSong.item.album.images[0].url;
      extractColor(imgUrl);
    }
  }, [currentSong]);

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

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercentage = (progress / duration) * 100;

  return (
    <div className="current-song-ui" style={{ backgroundColor }}>

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
        <AlbumComponent currentSong={currentSong} imgRef={imgRef} />
      )}

      {currentSong && !isPodcastOrEpisode && (
        <SongProgressComponent progress={progress} duration={duration} progressPercentage={progressPercentage} formatTime={formatTime} />
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
