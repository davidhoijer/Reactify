import {act, renderHook, waitFor} from "@testing-library/react";
import {fetchCurrentSong} from "../api/spotifyApi";
import {useCurrentPlaybackPolling} from "./useCurrentPlaybackPolling";
import type {CurrentSong} from "../types/CurrentSong";

jest.mock("../api/spotifyApi", () => ({
  fetchCurrentSong: jest.fn(),
}));

const song = {
  currently_playing_type: "track",
  is_playing: true,
  progress_ms: 250,
  item: {id: "track-1", duration_ms: 1000, album: {id: "album-1", images: [{url: "cover.jpg"}]}},
} as CurrentSong;

describe("useCurrentPlaybackPolling", () => {
  beforeEach(() => {
    document.dispatchEvent(new Event("visibilitychange"));
    jest.mocked(fetchCurrentSong).mockReset();
  });

  it("loads playback state and exposes a manual refresh", async () => {
    const fetchMock = jest.mocked(fetchCurrentSong).mockResolvedValue(song);
    const {result, unmount} = renderHook(() => useCurrentPlaybackPolling(true));

    await waitFor(() => expect(result.current.playback).toEqual(expect.objectContaining({
      durationMs: 1000,
      progressMs: 250,
      isPlaying: true,
    })));

    await act(async () => {
      await result.current.refresh();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    unmount();
  });

  it("clears playback when Spotify reports no active item", async () => {
    jest.mocked(fetchCurrentSong).mockResolvedValue(null);
    const {result, unmount} = renderHook(() => useCurrentPlaybackPolling(true));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.currentSong).toBeNull();
    expect(result.current.playback).toBeNull();
    expect(result.current.error).toBeNull();
    unmount();
  });
});
