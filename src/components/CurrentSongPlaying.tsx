import {useSpotifyUserProfile} from "../api/spotifyApi";
import Box from "@mui/material/Box";
import React from "react";

const CurrentSongComponent = () => {
    const { isLoading, error, data } = useSpotifyUserProfile();

    if (isLoading) return (
        <Box>
            Loading...
        </Box>
    );
    if (error) 
        console.log('An error occurred while fetching current song ', error);

    return (
        <div>
            Loaded
            <h1>{data?.display_name}</h1>
        </div>
    );
}

export default CurrentSongComponent;