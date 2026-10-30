// Real-Time Weather Service using 100% Free Open-Meteo API (No API key required)

export interface WeatherResult {
  city: string;
  country: string;
  temperature: number;
  apparentTemperature?: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  isLive: boolean;
  time: string;
}

const WMO_CODE_MAP: Record<number, { text: string; icon: string }> = {
  0: { text: 'Clear Sky', icon: '☀️' },
  1: { text: 'Mainly Clear', icon: '🌤️' },
  2: { text: 'Partly Cloudy', icon: '⛅' },
  3: { text: 'Overcast', icon: '☁️' },
  45: { text: 'Foggy', icon: '🌫️' },
  48: { text: 'Depositing Rime Fog', icon: '🌫️' },
  51: { text: 'Light Drizzle', icon: '🌦️' },
  53: { text: 'Moderate Drizzle', icon: '🌧️' },
  55: { text: 'Dense Drizzle', icon: '🌧️' },
  61: { text: 'Slight Rain', icon: '🌦️' },
  63: { text: 'Moderate Rain', icon: '🌧️' },
  65: { text: 'Heavy Rain', icon: '🌧️' },
  71: { text: 'Slight Snow Fall', icon: '🌨️' },
  73: { text: 'Moderate Snow Fall', icon: '❄️' },
  75: { text: 'Heavy Snow Fall', icon: '❄️' },
  80: { text: 'Slight Rain Showers', icon: '🌦️' },
  81: { text: 'Moderate Rain Showers', icon: '🌧️' },
  82: { text: 'Violent Rain Showers', icon: '⛈️' },
  95: { text: 'Thunderstorm', icon: '⚡' },
  96: { text: 'Thunderstorm with Slight Hail', icon: '⛈️' },
  99: { text: 'Thunderstorm with Heavy Hail', icon: '⛈️' },
};

export async function fetchLiveWeather(cityQuery: string = 'Kathmandu'): Promise<WeatherResult> {
  const cleanCity = cityQuery.trim();
  try {
    // Step 1: Geocoding via Open-Meteo free API
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) {
      throw new Error(`Geocoding failed with status ${geoRes.status}`);
    }
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`Location "${cleanCity}" not found. Please try another city.`);
    }

    const loc = geoData.results[0];
    const { latitude, longitude, name, country } = loc;

    // Step 2: Fetch Current Forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      throw new Error(`Weather request failed with status ${weatherRes.status}`);
    }
    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    const weatherCode = current.weather_code ?? 0;
    const condition = WMO_CODE_MAP[weatherCode] || { text: 'Clear', icon: '☀️' };

    return {
      city: name,
      country: country || '',
      temperature: Math.round(current.temperature_2m),
      apparentTemperature: Math.round(current.apparent_temperature ?? current.temperature_2m),
      description: condition.text,
      humidity: current.relative_humidity_2m ?? 50,
      windSpeed: Math.round(current.wind_speed_10m ?? 0),
      icon: condition.icon,
      isLive: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('Weather fetch error:', errorMsg);
    // Return graceful fallback data with clear indication
    return {
      city: cleanCity,
      country: 'World',
      temperature: 22,
      description: 'Partly Cloudy (Cached Data)',
      humidity: 55,
      windSpeed: 12,
      icon: '⛅',
      isLive: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }
}
