import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import {createTheme, ThemeProvider} from "@mui/material/styles";
import MainPage from "./components/MainPage";
import CssBaseline from "@mui/material/CssBaseline";
import {VibrantProvider} from "./contexts/VibrantContext";

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
  typography: {
    fontFamily: 'Helvetica, Arial, sans-serif',
  }
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        disableGutters
        maxWidth={false}
        sx={{
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          p: 2
        }}
      >
        <VibrantProvider>
          <Box sx={{ width: '100%' }}>
            {/*<StartPageHeader/>*/}
            <MainPage />
          </Box>
        </VibrantProvider>
      </Container>
    </ThemeProvider>
  );
}