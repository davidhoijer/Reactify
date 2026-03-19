import React from 'react';
import { CurrentSong } from "../types/CurrentSong";
import Box from "@mui/material/Box";

interface AlbumComponentProps {
  currentSong: CurrentSong;
}

const AlbumComponent: React.FC<AlbumComponentProps> = ({ currentSong }) => {
  const hasAlbumImage = currentSong?.item?.album?.images?.length > 0;
  return (
      <Box className="album-image-box">
        {currentSong && hasAlbumImage && (
          <img
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
