import useMediaQuery from "@mui/material/useMediaQuery";

const WIDE_VIEWPORT_QUERY = "(min-width:700px)";

export function useIsWideViewport(): boolean {
  return useMediaQuery(WIDE_VIEWPORT_QUERY);
}
