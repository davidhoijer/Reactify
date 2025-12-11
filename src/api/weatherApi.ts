// smhiApi.ts

const SMHI_BASE_URL = "https://opendata-download-metobs.smhi.se/api/version/latest";

export interface SmhiStation {
  key: string;
  name: string;
  owner: string;
  height: number;
  latitude: number;
  longitude: number;
  active: boolean;
  from: string;
  to: string;
  [key: string]: unknown;
}

export interface SmhiParameterStationsResponse {
  key: string;
  title: string;
  summary: string;
  unit: string;
  station: SmhiStation[];
  [key: string]: unknown;
}

async function smhiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${SMHI_BASE_URL}${path}`;
  const res = await fetch(url, { method: "GET", ...init });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SMHI request failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Hämtar alla stationer för en parameter (ex: 4 = lufttemperatur).
 */
export async function fetchStationsForParameter(
  parameterId: number | string
): Promise<SmhiParameterStationsResponse> {
  return smhiFetch(`/parameter/${parameterId}.json`);
}

/**
 * Hämta EN specifik station för en parameter.
 * T.ex. Göteborg 71420 för temperatur (4).
 */
export async function fetchStationById(
  parameterId: number | string,
  stationId: string | number
): Promise<SmhiStation | null> {
  const data = await fetchStationsForParameter(parameterId);
  return data.station.find(s => s.key === String(stationId)) ?? null;
}

/**
 * Convenience: hämta Göteborgs temperaturstation (71420).
 */
export async function fetchGoteborgTemperatureStation(): Promise<SmhiStation | null> {
  return fetchStationById(1, "71420");
}