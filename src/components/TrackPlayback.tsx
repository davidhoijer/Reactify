import React from "react";
import Box from "@mui/material/Box";
import type {CurrentSong} from "../types/CurrentSong";
import type {PlaybackState} from "../types/PlaybackState";
import AlbumComponent from "./AlbumComponent";
import PlaybackControls from "./PlaybackControls";
import SongProgressComponent from "./SongProgressComponent";
import TitleAndArtistComponent from "./TitleAndArtistComponent";

interface TrackPlaybackProps {
  actionsSelected: boolean;
  currentSong: CurrentSong;
  controlsColor: string;
  formatTime: (time: number) => string;
  isWideViewport: boolean;
  mobilePanelColor: string;
  playback: PlaybackState | null;
}

const TrackPlayback: React.FC<TrackPlaybackProps> = ({
  actionsSelected,
  controlsColor,
  currentSong,
  formatTime,
  isWideViewport,
  mobilePanelColor,
  playback,
}) => (
  <>
    <AlbumComponent currentSong={currentSong}/>

    <Box
      className="song-info-box"
      style={{
        backgroundColor: isWideViewport ? "transparent" : mobilePanelColor,
      }}
    >
      <TitleAndArtistComponent currentSong={currentSong}/>

      {playback && (
        <SongProgressComponent
          duration={playback.durationMs}
          initialProgress={playback.progressMs}
          isPlaying={playback.isPlaying}
          syncedAt={playback.syncedAt}
          formatTime={formatTime}
        />
      )}

      {actionsSelected && (
        <PlaybackControls
          iconColor={controlsColor}
          playback={playback}
        />
      )}
    </Box>
  </>
);

export default TrackPlayback;
