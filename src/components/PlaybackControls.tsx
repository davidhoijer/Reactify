import React from "react";
import PauseCircleOutlinedIcon from "@mui/icons-material/PauseCircleOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import SkipNextOutlinedIcon from "@mui/icons-material/SkipNextOutlined";
import SkipPreviousOutlinedIcon from "@mui/icons-material/SkipPreviousOutlined";
import {fetchCurrentSong, pauseTrack, playNextTrack, playPreviousTrack, resumeTrack} from "../api/spotifyApi";
import type {PlaybackState} from "../types/PlaybackState";

interface PlaybackControlsProps {
  iconColor: string;
  playback: PlaybackState | null;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({iconColor, playback}) => {
  const refreshPlayback = async () => {
    await fetchCurrentSong();
  };

  return (
    <div className="controls">
      <button className="control-button" onClick={async () => {
        await playPreviousTrack();
        await refreshPlayback();
      }}>
        <SkipPreviousOutlinedIcon className="icon-style" htmlColor={iconColor}/>
      </button>

      {playback?.isPlaying ? (
        <button className="control-button" onClick={async () => {
          await pauseTrack();
        }}>
          <PauseCircleOutlinedIcon className="icon-style" htmlColor={iconColor}/>
        </button>
      ) : (
        <button className="control-button" onClick={async () => {
          await resumeTrack();
          await refreshPlayback();
        }}>
          <PlayCircleOutlinedIcon className="icon-style" htmlColor={iconColor}/>
        </button>
      )}

      <button className="control-button" onClick={async () => {
        await playNextTrack();
        await refreshPlayback();
      }}>
        <SkipNextOutlinedIcon className="icon-style" htmlColor={iconColor}/>
      </button>
    </div>
  );
};

export default PlaybackControls;
