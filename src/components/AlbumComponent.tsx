import React, {useContext} from 'react';
import { CurrentSong } from "../types/CurrentSong";
import {VibrantContext} from "../contexts/VibrantContext";

interface AlbumComponentProps {
  currentSong: CurrentSong;
  imgRef: React.RefObject<HTMLImageElement>;
}

const AlbumComponent: React.FC<AlbumComponentProps> = ({ currentSong, imgRef }) => {

  const {darkVibrant} = useContext(VibrantContext);
  
  return (
    <div>
      <div className="album-art">
        {currentSong && currentSong?.item.album.images.length > 0 && (
          <img
            ref={imgRef}
            src={currentSong.item.album.images[0].url}
            alt={currentSong.item.album.name}
            // width={300}
            // height={300}
            decoding="async"
            loading="lazy"
            className="album-image"
          />
        )}
      </div>
      <div className="song-info">
        <h2 className="song-title" style={{color: darkVibrant}}>{currentSong?.item.name}</h2>
        <h3 className="song-artist" style={{color: darkVibrant}}>{currentSong?.item.artists[0].name}</h3>
      </div>
    </div>
  );
};

export default AlbumComponent;
