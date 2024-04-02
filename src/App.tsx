import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import ProTip from './components/ProTip';
import Copyright from "./components/Copyright";
import StartPageHeader from "./components/StartPageHeader";
import Authorize from "./components/Authorize";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import NowPlaying from "./components/NowPlaying";

const theme = createTheme({
    palette: {
        primary:{
            main:"#1DB954"
        },
        secondary: {
            main: "#2c3e50"
        },
    },
});

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="sm" sx={{backgroundColor:"secondary.main"}}>
                <Box flex={1} sx={{ my: 4 }}>
                    <StartPageHeader/>
                    <Authorize/>
                    <NowPlaying/>
                    <ProTip />
                    <Copyright />
                </Box>
            </Container>
        </ThemeProvider>
    );
}