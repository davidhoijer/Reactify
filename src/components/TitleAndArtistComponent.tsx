import React, {useContext} from 'react';
import { CurrentSong } from "../types/CurrentSong";
import {VibrantContext} from "../contexts/VibrantContext";
import Box from "@mui/material/Box";

interface TitleAndArtistComponentProps {
  currentSong: CurrentSong;
}

const TitleAndArtistComponent: React.FC<TitleAndArtistComponentProps> = ({ currentSong }) => {

  const {darkVibrant, lightVibrant} = useContext(VibrantContext);
  const isWide = window.innerWidth > 700;
  return (
      <Box className="song-info">
        <h2 className="song-title" style={{color: isWide ? lightVibrant : darkVibrant}}>{currentSong?.item.name}</h2>
        <h3 className="song-artist" style={{color: isWide ? lightVibrant : darkVibrant}}>{currentSong?.item.artists[0].name}</h3>
      </Box>
  );
};

export default TitleAndArtistComponent;
