import {useContext, useEffect, useMemo, useState} from "react";
import {VibrantContext, VibrantPalette} from "../contexts/VibrantContext";
import type {CurrentSong} from "../types/CurrentSong";

const albumPaletteCache = new Map<string, VibrantPalette>();

export function useAlbumVibrantPalette(currentSong: CurrentSong | null): string {
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const {vibrantColours, setVibrantPalette} = useContext(VibrantContext);

  const isPodcastOrEpisode = currentSong?.currently_playing_type === "episode";
  const albumId = currentSong?.item?.album?.id;
  const smallestImageUrl = useMemo(() => {
    const images = currentSong?.item?.album?.images;
    if (!images?.length) return null;
    return images[images.length - 1]?.url || images[0]?.url;
  }, [currentSong?.item?.album?.images]);

  useEffect(() => {
    if (isPodcastOrEpisode || !albumId || !smallestImageUrl) {
      setBackgroundColor("#323232");
      return;
    }

    const cachedPalette = albumPaletteCache.get(albumId);
    if (cachedPalette) {
      setVibrantPalette(cachedPalette);
      setBackgroundColor(cachedPalette.mainVibrant);
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        const palette = await vibrantColours(smallestImageUrl);
        if (!cancelled) {
          albumPaletteCache.set(albumId, palette);
          setVibrantPalette(palette);
          setBackgroundColor(palette.mainVibrant);
        }
      } catch {
        if (!cancelled) setBackgroundColor("#ffffff");
      }
    };

    (window.requestIdleCallback ?? window.setTimeout)(run);

    return () => {
      cancelled = true;
    };
  }, [
    albumId,
    isPodcastOrEpisode,
    setVibrantPalette,
    smallestImageUrl,
    vibrantColours,
  ]);

  return backgroundColor;
}
