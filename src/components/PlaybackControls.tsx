import React, {useState} from "react";
import PauseCircleOutlinedIcon from "@mui/icons-material/PauseCircleOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import SkipNextOutlinedIcon from "@mui/icons-material/SkipNextOutlined";
import SkipPreviousOutlinedIcon from "@mui/icons-material/SkipPreviousOutlined";
import {pauseTrack, playNextTrack, playPreviousTrack, resumeTrack} from "../api/spotifyApi";
import type {PlaybackState} from "../types/PlaybackState";

interface PlaybackControlsProps {
  iconColor: string;
  playback: PlaybackState | null;
  refreshPlayback: () => Promise<void>;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({iconColor, playback, refreshPlayback}) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAction = async (action: () => Promise<unknown>) => {
    setPending(true);
    setError(null);
    try {
      await action();
      await refreshPlayback();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="controls" aria-busy={pending}>
      <button aria-label="Previous track" className="control-button" disabled={pending} onClick={() => runAction(playPreviousTrack)}>
        <SkipPreviousOutlinedIcon className="icon-style" htmlColor={iconColor}/>
      </button>

      {playback?.isPlaying ? (
        <button aria-label="Pause" className="control-button" disabled={pending} onClick={() => runAction(pauseTrack)}>
          <PauseCircleOutlinedIcon className="icon-style" htmlColor={iconColor}/>
        </button>
      ) : (
        <button aria-label="Play" className="control-button" disabled={pending} onClick={() => runAction(resumeTrack)}>
          <PlayCircleOutlinedIcon className="icon-style" htmlColor={iconColor}/>
        </button>
      )}

      <button aria-label="Next track" className="control-button" disabled={pending} onClick={() => runAction(playNextTrack)}>
        <SkipNextOutlinedIcon className="icon-style" htmlColor={iconColor}/>
      </button>
      {error && <div role="alert">{error}</div>}
    </div>
  );
};

export default PlaybackControls;
