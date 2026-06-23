const COUNTY_COORDS: Record<string, { lat: number; lng: number }> = {
  Juba: { lat: 4.85, lng: 31.58 },
  Wau: { lat: 7.7, lng: 27.99 },
  Aweil: { lat: 8.77, lng: 27.4 },
  Bor: { lat: 6.21, lng: 31.56 },
  Rumbek: { lat: 6.8, lng: 29.68 },
};

const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';
const TIMEZONE = 'Africa/Juba';
const CACHE_TTL_MS = 15 * 60 * 1000;

export interface ForecastDay {
  day: string;
  date: string;
  temp: number;
  tempMin: number;
  rainfall: number;
  humidity: number;
  condition: string;
}

export interface CountyWeather {
  county: string;
  lat: number;
  lng: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  observedAt: string;
  forecast: ForecastDay[];
}

export interface LiveWeatherPayload {
  current: CountyWeather[];
  fetchedAt: string;
  source: 'open-meteo';
}

interface OpenMeteoResponse {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    relative_humidity_2m_mean: number[];
    weather_code: number[];
  };
}

let cache: { payload: LiveWeatherPayload; expiresAt: number } | null = null;

function weatherCondition(code: number): string {
  if (code === 0) return 'Sunny';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Cloudy';
  if (code <= 57) return 'Light Rain';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Heavy Rain';
  if (code <= 86) return 'Snow Showers';
  return 'Thunderstorm';
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

function formatForecastDay(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  const short = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  if (target === today) return `Today · ${short}`;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (target === startOfDay(tomorrow)) return `Tomorrow · ${short}`;
  return short;
}

async function fetchCountyWeather(county: string, coords: { lat: number; lng: number }): Promise<CountyWeather> {
  const params = new URLSearchParams({
    latitude: String(coords.lat),
    longitude: String(coords.lng),
    timezone: TIMEZONE,
    forecast_days: '7',
    wind_speed_unit: 'kmh',
    current: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean',
  });

  const res = await fetch(`${OPEN_METEO}?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo request failed for ${county} (${res.status})`);

  const data = (await res.json()) as OpenMeteoResponse;
  const current = data.current;
  const daily = data.daily;

  if (!current || !daily) throw new Error(`Incomplete weather data for ${county}`);

  const forecast: ForecastDay[] = daily.time.map((date, i) => ({
    day: formatForecastDay(date),
    date,
    temp: Math.round(daily.temperature_2m_max[i]),
    tempMin: Math.round(daily.temperature_2m_min[i]),
    rainfall: Math.round(daily.precipitation_sum[i] * 10) / 10,
    humidity: Math.round(daily.relative_humidity_2m_mean[i]),
    condition: weatherCondition(daily.weather_code[i]),
  }));

  return {
    county,
    lat: coords.lat,
    lng: coords.lng,
    temperature: Math.round(current.temperature_2m),
    humidity: Math.round(current.relative_humidity_2m),
    rainfall: Math.round(current.precipitation * 10) / 10,
    windSpeed: Math.round(current.wind_speed_10m),
    condition: weatherCondition(current.weather_code),
    observedAt: current.time,
    forecast,
  };
}

export async function getLiveWeather(force = false): Promise<LiveWeatherPayload> {
  if (!force && cache && cache.expiresAt > Date.now()) {
    return cache.payload;
  }

  const counties = Object.entries(COUNTY_COORDS);
  const settled = await Promise.allSettled(counties.map(([county, coords]) => fetchCountyWeather(county, coords)));

  const results: CountyWeather[] = [];
  for (let i = 0; i < settled.length; i++) {
    const outcome = settled[i];
    if (outcome.status === 'fulfilled') {
      results.push(outcome.value);
      continue;
    }
    const [county, coords] = counties[i];
    console.warn(`[weather] live fetch failed for ${county}:`, outcome.reason);
    results.push({
      county,
      lat: coords.lat,
      lng: coords.lng,
      temperature: 28,
      humidity: 60,
      rainfall: 0,
      windSpeed: 8,
      condition: 'Partly Cloudy',
      observedAt: new Date().toISOString(),
      forecast: [],
    });
  }

  if (results.length === 0) {
    throw new Error('Unable to load weather data');
  }

  const payload: LiveWeatherPayload = {
    current: results,
    fetchedAt: new Date().toISOString(),
    source: 'open-meteo',
  };

  cache = { payload, expiresAt: Date.now() + CACHE_TTL_MS };
  return payload;
}
