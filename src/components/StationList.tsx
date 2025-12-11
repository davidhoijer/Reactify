import {useEffect, useState} from "react";
import {fetchGoteborgTemperatureStation, SmhiStation} from "../api/weatherApi";

export function GothenburgStationInfo() {
  const [station, setStation] = useState<SmhiStation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoteborgTemperatureStation()
      .then(setStation)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div>SMHI error: {error}</div>;
  if (!station) return <div>Laddar Göteborgs SMHI-station...</div>;

  return (
    <div>
      <h3>{station.name}</h3>
      <p>Lat: {station.latitude}</p>
      <p>Lon: {station.longitude}</p>
      <p>Höjd: {station.height} m</p>
    </div>
  );
}