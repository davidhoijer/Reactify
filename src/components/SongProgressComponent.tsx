import React, {useContext} from 'react';
import '../styling/Styling.css';
import { Typography } from '@mui/material';
import {VibrantContext} from "../contexts/VibrantContext";
import Box from "@mui/material/Box";

interface SongProgressProps {
  progress: number;
  duration: number;
  progressPercentage: number;
  formatTime: (time: number) => string;
}

const SongProgress: React.FC<SongProgressProps> = ({ progress, duration, progressPercentage, formatTime }) => {

  const {darkVibrant, lightVibrant} = useContext(VibrantContext);
  const isWide = window.innerWidth > 700;
  
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
