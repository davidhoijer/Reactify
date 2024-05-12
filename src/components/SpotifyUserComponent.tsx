import {useSpotifyUserProfile} from "../api/spotifyApi";
import Box from "@mui/material/Box";
import React from "react";

const SpotifyUserComponent = () => {
    const { isLoading, error, data } = useSpotifyUserProfile();

    if (isLoading) return (
        <Box>
            Loading...
        </Box>
    );
    if (error) console.log('An error occurred while fetching the user data ', error);

    return (
        <div>
            Loaded
            <h1>{data?.display_name}</h1>
        </div>
    );
}

export default SpotifyUserComponent;