import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlaybackControls from "./PlaybackControls";
import {pauseTrack, playNextTrack, resumeTrack} from "../api/spotifyApi";

jest.mock("../api/spotifyApi", () => ({
  pauseTrack: jest.fn(),
  playNextTrack: jest.fn(),
  playPreviousTrack: jest.fn(),
  resumeTrack: jest.fn(),
}));

const playback = {durationMs: 1000, progressMs: 100, isPlaying: true, syncedAt: 0};

describe("PlaybackControls", () => {
  it("refreshes after pausing", async () => {
    const user = userEvent.setup();
    const refresh = jest.fn().mockResolvedValue(undefined);

    render(<PlaybackControls iconColor="#fff" playback={playback} refreshPlayback={refresh}/>);
    await user.click(screen.getByRole("button", {name: "Pause"}));

    expect(pauseTrack).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("runs the appropriate action when playback is paused", async () => {
    const user = userEvent.setup();
    const refresh = jest.fn().mockResolvedValue(undefined);

    render(<PlaybackControls iconColor="#fff" playback={{...playback, isPlaying: false}} refreshPlayback={refresh}/>);
    await user.click(screen.getByRole("button", {name: /play/i}));

    expect(resumeTrack).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("shows action errors", async () => {
    const user = userEvent.setup();
    jest.mocked(playNextTrack).mockRejectedValueOnce(new Error("Device unavailable"));

    render(<PlaybackControls iconColor="#fff" playback={playback} refreshPlayback={jest.fn()}/>);
    await user.click(screen.getByRole("button", {name: /next/i}));

    expect(screen.getByRole("alert")).toHaveTextContent("Device unavailable");
  });
});
