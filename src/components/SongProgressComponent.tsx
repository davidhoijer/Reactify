import React from 'react';
import '../styling/Styling.css';
import { Typography } from '@mui/material';

interface SongProgressProps {
  progress: number;
  duration: number;
  progressPercentage: number;
  formatTime: (time: number) => string;
}

const SongProgress: React.FC<SongProgressProps> = ({ progress, duration, progressPercentage, formatTime }) => {
  return (
    <div className="song-progress">
      <div className="song-timer">
        <Typography variant='h6' style={{ fontWeight: "bold" }}>
          <span>{formatTime(progress)}</span> / <span>{formatTime(duration)}</span>
        </Typography>
      </div>
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
      </div>
    </div>
  );
};

export default SongProgress;
