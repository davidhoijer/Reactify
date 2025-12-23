import React, {useContext} from 'react';
import { CurrentSong } from "../types/CurrentSong";
import {VibrantContext} from "../contexts/VibrantContext";
import TitleAndArtistComponent from "./TitleAndArtistComponent";
import Box from "@mui/material/Box";

interface AlbumComponentProps {
  currentSong: CurrentSong;
  imgRef: React.RefObject<HTMLImageElement>;
}

const AlbumComponent: React.FC<AlbumComponentProps> = ({ currentSong, imgRef }) => {
  const hasAlbumImage = currentSong?.item?.album?.images?.length > 0;
  return (
      <Box>
        {currentSong && hasAlbumImage && (
          <img
            ref={imgRef}
            src={currentSong.item.album.images[0].url}
            alt={currentSong.item.album.name}
            decoding="async"
            loading="lazy"
            className="album-image"
          />
        )}
      </Box>
  );
};

export default AlbumComponent;
