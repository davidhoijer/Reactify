# Reactify

A React + TypeScript app that shows your currently playing Spotify track with a color‑adaptive UI based on the album art. It uses Spotify OAuth (PKCE), refresh tokens, and adaptive polling to keep the UI up to date.


<img src="src/images/Screenshot 2026-02-18 at 15.33.11.png" alt="Widescreen" width="800">



## Features
- Spotify PKCE login with refresh token handling.
- Currently playing track UI with album art and color‑extracted theming.
- Progress bar with time remaining.
- Adaptive polling cadence (fast when playing, slower when paused/idle).
- MUI theming and a custom “vibrant” palette via `node-vibrant`.

## Tech Stack
- React 18 + TypeScript
- Material UI
- `node-vibrant` for color extraction


<img src="src/images/Screenshot 2026-02-18 at 15.40.58.png" alt="RaspberryPie Screen" height="700">



## Getting Started

### Prerequisites
- Node.js 18+ recommended
- A Spotify Developer app with a Redirect URI

### Environment Variables
Create a `.env` file in the project root with:

```bash
REACT_APP_CLIENT_ID=your_spotify_client_id
REACT_APP_REDIRECT_URI=http://localhost:8080/
REACT_APP_SCOPES=user-read-currently-playing user-read-playback-state user-top-read
```

Notes:
- `REACT_APP_REDIRECT_URI` defaults to the current origin if omitted.
- `REACT_APP_SCOPES` defaults to the scopes shown above if omitted.

### Install and Run

```bash
npm install
npm start
```

The app runs on `http://localhost:8080/`.

## How It Works (High Level)
- On first load, the app redirects to Spotify’s authorization endpoint using PKCE.
- Tokens are stored in `localStorage` with a short expiry buffer.
- The app refreshes access tokens automatically and retries requests once if needed.
- Polling cadence adapts to playback state.
- Album art colors are extracted and used to style the UI.

## Project Structure

```text
src/
  api/              Spotify API helpers
  components/       UI components
  contexts/         Vibrant color context/provider
  styling/          CSS styling
  types/            TypeScript types
```


## Scripts
- `npm start` — run the dev server on port 8080
- `npm build` — build for production
- `npm test` — run tests
- `npm run lint` — lint the project

## Troubleshooting
- If login loops or refresh fails, clear site data and re‑authorize to get a new refresh token.
- Ensure your Spotify app has the exact Redirect URI configured in the Spotify dashboard.
