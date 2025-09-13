import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import {createTheme, ThemeProvider} from "@mui/material/styles";
import MainPage from "./components/MainPage";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    background: {
      default: "#121212",  // Background color for the entire app
      paper: "#181818",    // Background color for components
    },
    text: {
      primary: "#ffffff",  // Text color to ensure readability on dark background
    }
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ backgroundColor: theme.palette.background.default, p: 1.5 }}>
        <Box >
          {/*<StartPageHeader/>*/}
          <MainPage></MainPage>
        </Box>
      </Container>
    </ThemeProvider>
  );
}