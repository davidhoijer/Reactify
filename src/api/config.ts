export const CLIENT_ID = process.env.REACT_APP_CLIENT_ID!;
export const REDIRECT_URI =
  process.env.REACT_APP_REDIRECT_URI || `${window.location.origin}/`;
export const SCOPES =
  process.env.REACT_APP_SCOPES ??
  "user-read-currently-playing user-read-playback-state user-top-read";