import React from 'react';
import {CurrentSong} from "../types/CurrentSong";

interface AlbumComponentProps {
  currentSong: CurrentSong; // Ideally, replace `any` with your specific song type
  imgRef: React.RefObject<HTMLImageElement>;
}

const AlbumComponent: React.FC<AlbumComponentProps> = ({currentSong, imgRef}) => {
  return (
    <div>
      <div className="album-art">
        {currentSong && currentSong?.item.album.images.length > 0 && (
          <img
            ref={imgRef}
            src={currentSong.item.album.images[0].url}
            alt={currentSong.item.album.name}
            className="album-image"
          />
        )}
      </div>
      <div className="song-info">
        tests
        <h2 className="song-title">{currentSong?.item.name}</h2>
        <h3 className="song-artist">{currentSong?.item.artists[0].name}</h3>
      </div>
    </div>
  );
};

export default AlbumComponent;
