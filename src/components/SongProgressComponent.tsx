import React, {useContext} from 'react';
import '../styling/Styling.css';
import { Typography } from '@mui/material';
import {VibrantContext} from "../contexts/VibrantContext";

interface SongProgressProps {
  progress: number;
  duration: number;
  progressPercentage: number;
  formatTime: (time: number) => string;
}

const SongProgress: React.FC<SongProgressProps> = ({ progress, duration, progressPercentage, formatTime }) => {

  const {darkVibrant, lightVibrant} = useContext(VibrantContext);

  
  return (
    <div className="song-progress">
      <div className="song-timer">
        <Typography variant='h5' style={{ fontWeight: "bold", color: darkVibrant }}>
          <span>{formatTime(progress)}</span> / <span>{formatTime(duration)}</span>
        </Typography>
      </div>
      <div className="progress-container" style={{backgroundColor: darkVibrant}}>
        <div className="progress-bar" style={{ width: `${progressPercentage}%` , backgroundColor: lightVibrant }} />
      </div>
    </div>
  );
};

export default SongProgress;
