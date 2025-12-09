import React, {useContext} from 'react';
import { CurrentSong } from "../types/CurrentSong";
import {VibrantContext} from "../contexts/VibrantContext";

interface TitleAndArtistComponentProps {
  currentSong: CurrentSong;
}

const TitleAndArtistComponent: React.FC<TitleAndArtistComponentProps> = ({ currentSong }) => {

  const {darkVibrant} = useContext(VibrantContext);

  return (
      <div className="song-info">
        <h2 className="song-title" style={{color: darkVibrant}}>{currentSong?.item.name}</h2>
        <h3 className="song-artist" style={{color: darkVibrant}}>{currentSong?.item.artists[0].name}</h3>
      </div>
  );
};

export default TitleAndArtistComponent;
