import {spotifyFetch, tokenStore} from "./apiClient";

describe("tokenStore", () => {
  beforeEach(() => localStorage.clear());

  it("stores and reads a token with a safety expiry buffer", () => {
    jest.spyOn(Date, "now").mockReturnValue(1_000_000);

    tokenStore.write({accessToken: "access", refreshToken: "refresh", expiresIn: 60});

    expect(tokenStore.read()).toEqual({
      accessToken: "access",
      refreshToken: "refresh",
      expiresAt: 1_045_000,
    });
    jest.restoreAllMocks();
  });
});

describe("spotifyFetch", () => {
  const request = "https://api.spotify.com/v1/me";
  const bag = {accessToken: "old-token", refreshToken: "refresh", expiresAt: 0};

  beforeEach(() => jest.restoreAllMocks());

  it("returns null for no-content responses", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(new Response(null, {status: 204}));

    await expect(spotifyFetch(request, {method: "GET"}, bag, jest.fn())).resolves.toBeNull();
  });

  it("refreshes once after an unauthorized response", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(null, {status: 401}))
      .mockResolvedValueOnce(new Response("{}", {status: 200}));
    const refresh = jest.fn().mockResolvedValue({access_token: "new-token", expires_in: 3600});

    await spotifyFetch(request, {method: "GET"}, bag, refresh);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[1][1]?.headers).toEqual({Authorization: "Bearer new-token"});
  });

  it("retries a rate-limited response after the requested delay", async () => {
    jest.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(null, {status: 429, headers: {"Retry-After": "0"}}))
      .mockResolvedValueOnce(new Response("{}", {status: 200}));

    await expect(spotifyFetch(request, {method: "GET"}, bag, jest.fn())).resolves.toBeInstanceOf(Response);
  });

  it("reports forbidden responses", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({error: {message: "Missing scope"}}), {status: 403}),
    );

    await expect(spotifyFetch(request, {method: "GET"}, bag, jest.fn()))
      .rejects.toThrow("Spotify error 403: Missing scope");
  });
});
