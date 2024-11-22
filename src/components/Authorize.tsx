import Box from "@mui/material/Box";
import React from "react";
import Typography from "@mui/material/Typography";
import {Button} from "@mui/material";

const searchParams = new URLSearchParams()
const currentParams = new URLSearchParams(window.location.search)

function Authorize(){
    
    return <Box>
        <Typography>
            Nowify is a simple Spotify 'Now Playing' screen designed for the Raspberry
            Pi. Login with Spotify below and start playing some music! 
            Spotify hex: #1DB954
            Background hex: #2c3e50
        </Typography>

        <Button color={"primary"} sx={{mt:2, borderRadius: 50}} variant={"contained"}>
            Login with Spotify
        </Button>
    </Box>
}

export default Authorize;