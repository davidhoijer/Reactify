import React from 'react';
import '../styling/Styling.css';

interface SongProgressProps {
  progress: number;
  duration: number;
  progressPercentage: number;
  formatTime: (time: number) => string;
}

const SongProgress: React.FC<SongProgressProps> = ({progress, duration, progressPercentage, formatTime}) => {
  return (
    <div className="song-progress">
      <div className="song-timer">
        <span>{formatTime(progress)}</span> / <span>{formatTime(duration)}</span>
      </div>
      <div className="progress-container">
        <div className="progress-bar" style={{width: `${progressPercentage}%`}}/>
      </div>
    </div>
  );
};

export default SongProgress;
