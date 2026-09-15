import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountMenu from "./AccountMenu";
import type {SpotifyUser} from "../types/SpotifyUser";

const profile = {
  display_name: "David Hoijer",
  images: [{url: "profile.jpg", height: 100, width: 100}],
} as SpotifyUser;

describe("AccountMenu", () => {
  it("shows the profile name and refreshes playback", async () => {
    const user = userEvent.setup();
    const refresh = jest.fn().mockResolvedValue(undefined);

    render(<AccountMenu userProfile={profile} onRefresh={refresh} onLogout={jest.fn()} />);
    await user.click(screen.getByRole("button", {name: /David Hoijer account menu/i}));
    await user.click(screen.getByRole("menuitem", {name: /refresh playback/i}));

    expect(screen.getByText("David Hoijer")).toBeInTheDocument();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("falls back to initials and calls logout", async () => {
    const user = userEvent.setup();
    const logout = jest.fn();

    render(<AccountMenu userProfile={{display_name: "Spotify User", images: []} as unknown as SpotifyUser} onRefresh={jest.fn()} onLogout={logout} />);
    expect(screen.getByText("SU")).toBeInTheDocument();

    await user.click(screen.getByRole("button", {name: /Spotify User account menu/i}));
    await user.click(screen.getByRole("menuitem", {name: /log out/i}));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
