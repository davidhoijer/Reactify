import React, {useEffect, useRef, useState} from 'react';
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

const CurrentSongComponent: React.FC<CurrentSongProps> = ({userProfile, currentSong}) => {
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const imgRef = useRef<HTMLImageElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Track if the song is playing


  useEffect(() => {
    const extractColor = async (imageUrl: string) => {
      const vibrant = new Vibrant(imageUrl);
      const palette = await vibrant.getPalette();
      const dominantColor = palette.Vibrant?.hex || '#ffffff'; // Fallback to white if not found
      setBackgroundColor(dominantColor);
    };

    if (currentSong && currentSong?.item.album.images.length > 0) {
      setProgress(currentSong.progress_ms || 0);
      setDuration(currentSong.item.duration_ms || 0);
      setIsPlaying(currentSong.is_playing); // Track the play status
      
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
          // Ensure we don't exceed the total duration
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
    <div className="current-song-ui" style={{backgroundColor}}>
      {/*<header className="current-song-header">*/}
      {/*  <h1>{userProfile?.display_name}</h1>*/}
      {/*</header>*/}


      {currentSong && (
        <AlbumComponent currentSong={currentSong} imgRef={imgRef}/>
      )}

      <SongProgressComponent progress={progress}
                             duration={duration}
                             progressPercentage={progressPercentage}
                             formatTime={formatTime}/>


      {/*<div className="controls">*/}
      {/*  <button className="control-button">⏮️</button>*/}
      {/*  {currentSong?.is_playing ? (*/}
      {/*    <button className="control-button">⏸️</button>*/}
      {/*  ) : (*/}
      {/*    <button className="control-button">▶️</button>*/}
      {/*  )}*/}
      {/*  <button className="control-button">⏭️</button>*/}
      {/*</div>*/}
    </div>
  );
};

export default CurrentSongComponent;
