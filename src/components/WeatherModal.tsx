import React, { useState, useEffect } from 'react';
import { X, CloudSun, Search, Wind, Droplets, Compass, Volume2 } from 'lucide-react';
import { fetchLiveWeather, WeatherResult } from '../services/weatherService';
import { soundEffects } from '../services/soundEffects';

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeakWeather: (text: string) => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  isOpen,
  onClose,
  onSpeakWeather,
}) => {
  const [cityInput, setCityInput] = useState('Kathmandu');
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !weather) {
      loadWeather('Kathmandu');
    }
  }, [isOpen]);

  const loadWeather = async (city: string) => {
    setLoading(true);
    soundEffects.playProcessingPulse();
    const result = await fetchLiveWeather(city);
    setWeather(result);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    loadWeather(cityInput.trim());
  };

  if (!isOpen) return null;

  const quickCities = ['Kathmandu', 'Pokhara', 'New Delhi', 'Mumbai', 'London', 'Tokyo', 'New York'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#070e1b] border border-cyan-500/40 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a1628] border-b border-cyan-900/60">
          <div className="flex items-center space-x-2 text-cyan-400 font-hud tracking-wider font-bold">
            <CloudSun className="w-4 h-4 text-cyan-400" />
            <span>METEOROLOGICAL TELEMETRY // OPEN-METEO LIVE</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-cyan-950 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-600 absolute left-3 top-3" />
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Search city (e.g. Kathmandu, Biratnagar, Delhi)..."
                className="w-full bg-[#050b14] border border-cyan-900/70 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-2 text-sm text-cyan-100 placeholder-cyan-800 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </form>

          {/* Quick city tags */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {quickCities.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCityInput(c);
                  loadWeather(c);
                }}
                className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  weather?.city.toLowerCase() === c.toLowerCase()
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                    : 'border-cyan-950 bg-[#091322] text-cyan-500 hover:text-cyan-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Weather Display */}
          {weather && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#09172c] to-[#040810] border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-white flex items-center gap-2">
                    {weather.city}
                    <span className="text-xs text-cyan-400 font-normal px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                      {weather.country || 'Global'}
                    </span>
                  </div>
                  <div className="text-sm text-cyan-300 mt-0.5">{weather.description}</div>
                  <div className="text-[10px] text-cyan-600 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    Live Open-Meteo Free API ({weather.time})
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl">{weather.icon}</div>
                  <div className="text-3xl font-bold text-cyan-200 font-mono mt-1">
                    {weather.temperature}°C
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-cyan-900/50 text-xs">
                <div className="flex items-center space-x-2 bg-[#060c18] p-2.5 rounded border border-cyan-950">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-slate-400 text-[10px]">HUMIDITY</div>
                    <div className="text-cyan-200 font-bold">{weather.humidity}%</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-[#060c18] p-2.5 rounded border border-cyan-950">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-slate-400 text-[10px]">WIND VELOCITY</div>
                    <div className="text-cyan-200 font-bold">{weather.windSpeed} km/h</div>
                  </div>
                </div>
              </div>

              {/* Speak Weather Button */}
              <button
                onClick={() => {
                  const speech = `Atmospheric report for ${weather.city}: Current condition is ${weather.description} at ${weather.temperature} degrees Celsius, with relative humidity of ${weather.humidity} percent.`;
                  onSpeakWeather(speech);
                }}
                className="w-full py-2 bg-[#0c1f38] hover:bg-[#112a4d] border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Vocalize Atmospheric Report</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
