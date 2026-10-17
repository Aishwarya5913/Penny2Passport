export type Location = {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
};
export type Forecast = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    time: string;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
};
export async function geocode(city: string): Promise<Location> {
  const r = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`,
    { signal: AbortSignal.timeout(12000) },
  );
  if (!r.ok) throw new Error("City search is unavailable. Please try again.");
  const data = (await r.json()) as { results?: Location[] };
  const location = data.results?.[0];
  if (!location) throw new Error("City not found. Try the nearest major city.");
  return location;
}
export async function forecast(lat: number, lon: number): Promise<Forecast> {
  const r = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`,
    { signal: AbortSignal.timeout(12000) },
  );
  if (!r.ok) throw new Error("Forecast is unavailable. Please try again.");
  return r.json();
}
export const conditions = (code: number) =>
  code === 0
    ? "Clear sky"
    : code <= 3
      ? "Partly cloudy"
      : code < 50
        ? "Foggy"
        : code < 70
          ? "Rain"
          : code < 80
            ? "Snow"
            : code < 95
              ? "Showers"
              : "Thunderstorms";
