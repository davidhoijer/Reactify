import React, {useContext, useEffect, useState} from 'react';
import '../styling/Styling.css';
import { Typography } from '@mui/material';
import {VibrantContext} from "../contexts/VibrantContext";
import Box from "@mui/material/Box";

interface SongProgressProps {
  duration: number;
  initialProgress: number;
  isPlaying: boolean;
  syncedAt: number;
  formatTime: (time: number) => string;
}

const SongProgress: React.FC<SongProgressProps> = ({ duration, initialProgress, isPlaying, syncedAt, formatTime }) => {

  const {darkVibrant, lightVibrant} = useContext(VibrantContext);
  const [now, setNow] = useState(() => Date.now());
  const isWide = window.innerWidth > 700;

  useEffect(() => {
    setNow(Date.now());
  }, [initialProgress, syncedAt, isPlaying, duration]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying]);

  const elapsed = isPlaying ? Math.max(0, now - syncedAt) : 0;
  const progress = Math.min(initialProgress + elapsed, duration);
  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <Box className="song-progress">
      <Box className="song-timer">
        <Typography variant='h5' style={{ fontWeight: "bold", color: isWide ? lightVibrant : darkVibrant }}>
          <span>{formatTime(progress)}</span> / <span>{formatTime(duration)}</span>
        </Typography>
      </Box>
      <Box className="progress-container" style={{backgroundColor: darkVibrant}}>
        <Box className="progress-bar" style={{ width: `${progressPercentage}%` , backgroundColor: lightVibrant }} />
      </Box>
    </Box>
  );
};

export default SongProgress;
