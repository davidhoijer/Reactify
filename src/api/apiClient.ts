type TokenBag = { accessToken: string; refreshToken: string; expiresAt: number };

export const tokenStore = {
  read(): TokenBag | null {
    const at = localStorage.getItem("access_token");
    const rt = localStorage.getItem("refresh_token");
    const exp = Number(localStorage.getItem("token_expiry_time") ?? 0);
    return at && rt ? { accessToken: at, refreshToken: rt, expiresAt: exp } : null;
  },
  write({ accessToken, refreshToken, expiresIn }: { accessToken: string; refreshToken: string; expiresIn: number }) {
    const expiresAt = Date.now() + expiresIn * 1000 - 15_000; // 15s marginal
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("token_expiry_time", String(expiresAt));
  },
  writeAccess(accessToken: string, expiresIn: number) {
    const expiresAt = Date.now() + expiresIn * 1000 - 15_000;
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("token_expiry_time", String(expiresAt));
  },
};

async function backoff(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export async function spotifyFetch(input: RequestInfo, init: RequestInit, bag: TokenBag, refreshOnce: () => Promise<{access_token:string; expires_in:number}>) {
  const doFetch = () => fetch(input, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${bag.accessToken}` },
  });

  let res = await doFetch();

  // 429 rate-limit
  if (res.status === 429) {
    const retry = Number(res.headers.get("Retry-After") || "1");
    await backoff(retry * 1000);
    res = await doFetch();
  }

  // 204 = No content (t.ex. inget spelas)
  if (res.status === 204) return null;

  // 401/400 -> testa refresh EN gång
  if (res.status === 401 || res.status === 400) {
    const { access_token, expires_in } = await refreshOnce();
    tokenStore.writeAccess(access_token, expires_in);
    const res2 = await fetch(input, {
      ...init,
      headers: { ...(init.headers || {}), Authorization: `Bearer ${access_token}` },
    });
    if (res2.status === 204) return null;
    if (!res2.ok) throw new Error(`Spotify error ${res2.status}`);
    return res2;
  }

  if (!res.ok) throw new Error(`Spotify error ${res.status}`);
  return res;
}
