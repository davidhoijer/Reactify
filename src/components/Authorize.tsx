import Box from "@mui/material/Box";
import React from "react";
import Typography from "@mui/material/Typography";
import {Button} from "@mui/material";



function Authorize(){

    const searchParams = new URLSearchParams()


    const initAuthorize = () => {

    }
    
    // const setAuthUrl = () => {
    //     searchParams.toString()
    //     searchParams.append('client_id', this.auth.clientId)
    //     searchParams.append('response_type', 'code')
    //     searchParams.append('redirect_uri', window.location.origin)
    //     searchParams.append(
    //         'state',
    //         [
    //             Math.random()
    //                 .toString(33)
    //                 .substring(2),
    //             Math.random()
    //                 .toString(34)
    //                 .substring(3),
    //             Math.random()
    //                 .toString(35)
    //                 .substring(4),
    //             Math.random()
    //                 .toString(36)
    //                 .substring(5)
    //         ].join('-')
    //     )
    //     searchParams.append('scope', 'user-read-currently-playing')
    //
    //     return `${this.endpoints.auth}?${searchParams.toString()}`
    // }
    
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