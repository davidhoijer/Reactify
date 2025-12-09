import React, {useContext} from 'react';
import { CurrentSong } from "../types/CurrentSong";
import {VibrantContext} from "../contexts/VibrantContext";
import TitleAndArtistComponent from "./TitleAndArtistComponent";

interface AlbumComponentProps {
  currentSong: CurrentSong;
  imgRef: React.RefObject<HTMLImageElement>;
}

const AlbumComponent: React.FC<AlbumComponentProps> = ({ currentSong, imgRef }) => {
  return (
    <div>
      <div className="album-art">
        {currentSong && currentSong?.item.album.images.length > 0 && (
          <img
            ref={imgRef}
            src={currentSong.item.album.images[0].url}
            alt={currentSong.item.album.name}
            width={300}
            height={300}
            decoding="async"
            loading="lazy"
            className="album-image"
          />
        )}
      </div>
      <div>
        <TitleAndArtistComponent currentSong={currentSong}></TitleAndArtistComponent>
      </div>
    </div>
  );
};

export default AlbumComponent;
