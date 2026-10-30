"""
REZA Real-Time Knowledge & Weather Subsystem
Uses 100% Free Open-Meteo API and DuckDuckGo (No API keys required)
"""

import requests
import json

class WeatherSearchEngine:
    def __init__(self):
        pass

    def get_live_weather(self, city="Kathmandu") -> str:
        try:
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
            geo_res = requests.get(geo_url, timeout=5)
            data = geo_res.json()
            if not data.get("results"):
                return f"Weather information for '{city}' could not be located."

            loc = data["results"][0]
            lat = loc["latitude"]
            lon = loc["longitude"]
            city_name = loc["name"]
            country = loc.get("country", "")

            w_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m&timezone=auto"
            w_res = requests.get(w_url, timeout=5)
            w_data = w_res.json()
            cur = w_data["current"]

            temp = cur["temperature_2m"]
            humidity = cur["relative_humidity_2m"]
            wind = cur["wind_speed_10m"]

            return (
                f"[LIVE ATMOSPHERIC REPORT]\\n"
                f"Location: {city_name}, {country}\\n"
                f"Temperature: {temp}°C (Apparent: {cur.get('apparent_temperature', temp)}°C)\\n"
                f"Relative Humidity: {humidity}%\\n"
                f"Wind Velocity: {wind} km/h\\n"
                f"Status: Live telemetry verified from Open-Meteo."
            )
        except Exception as e:
            return f"Weather service temporary timeout: {e}. Check internet connection."

    def search_duckduckgo(self, query: str) -> str:
        try:
            wiki_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{query.strip()}"
            res = requests.get(wiki_url, timeout=5)
            if res.status_code == 200:
                d = res.json()
                if "extract" in d:
                    return f"[LIVE WIKIPEDIA FACT]\\n{d['extract']}"

            ddg_url = f"https://api.duckduckgo.com/?q={query}&format=json&no_html=1"
            res2 = requests.get(ddg_url, timeout=5)
            d2 = res2.json()
            if d2.get("AbstractText"):
                return f"[DUCKDUCKGO KNOWLEDGE]\\n{d2['AbstractText']}"

            return f"Search dispatched for '{query}'. No single concise abstract was found; consult browser results."
        except Exception as e:
            return f"Search engine unreachable: {e}"
