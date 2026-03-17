import {Artist2} from "../types/CurrentSong";
import Box from "@mui/material/Box";
import React, {useContext} from "react";
import {VibrantContext} from "../contexts/VibrantContext";
import {Typography} from "@mui/material";

interface TopArtistsProps { 
  topArtists: Artist2[] | null;
}

const TopArtists: React.FC<TopArtistsProps> = ({topArtists}) => {

  const {lightVibrant} = useContext(VibrantContext);

  return (
    <Box className="current-song-ui" display="flex" flexDirection={'column'} justifyContent="center" sx={{marginTop: '1rem'}}>
      <h2 style={{color: lightVibrant}}>
        Top Artists last 4 weeks:
      </h2>

      <Box>
        {topArtists?.map((item, index: number) => (
          <Box style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
            <Typography noWrap variant={'h6'} key={item.id} style={{color: lightVibrant, width: '142px'}}>{index + 1}. {item.name}</Typography>
            <img src={item.images[0].url}
                 alt={item.name}
                 decoding="async"
                 loading="lazy"
                 width={'142px'}
            />
          </Box>

        ))}
      </Box>

    
    </Box>
  
  );
};

export default TopArtists;