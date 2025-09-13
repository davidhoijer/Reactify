export const CLIENT_ID = process.env.REACT_APP_CLIENT_ID ?? "";
export const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI ?? `${window.location.origin}/`;
export const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-read-currently-playing",
].join(" ");
