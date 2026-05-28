import React, {useContext} from 'react';
import { CurrentSong } from "../types/CurrentSong";
import {VibrantContext} from "../contexts/VibrantContext";
import Box from "@mui/material/Box";
import {useIsWideViewport} from "../hooks/useIsWideViewport";

interface TitleAndArtistComponentProps {
  currentSong: CurrentSong;
}

const TitleAndArtistComponent: React.FC<TitleAndArtistComponentProps> = ({ currentSong }) => {

  const {darkVibrant, lightVibrant} = useContext(VibrantContext);
  const isWideViewport = useIsWideViewport();
  return (
      <Box className="song-info">
        <h2 className="song-title" style={{color: isWideViewport ? lightVibrant : darkVibrant}}>{currentSong?.item.name}</h2>
        <h3 className="song-artist" style={{color: isWideViewport ? lightVibrant : darkVibrant}}>{currentSong?.item.artists[0].name}</h3>
      </Box>
  );
};

export default TitleAndArtistComponent;
