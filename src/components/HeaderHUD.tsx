import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { Volume2, VolumeX, Globe, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface HeaderHUDProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  soundEffectsEnabled: boolean;
  onToggleSoundEffects: () => void;
  cpuUsage: number;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  currentLanguage,
  onLanguageChange,
  soundEffectsEnabled,
  onToggleSoundEffects,
  cpuUsage,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [clockMode, setClockMode] = useState<'local' | 'utc' | 'npt' | 'ist'>('local');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getFormattedTime = () => {
    if (clockMode === 'utc') {
      return {
        time: time.toUTCString().slice(17, 25),
        label: 'UTC TIME',
      };
    }
    if (clockMode === 'npt') {
      // Nepal is UTC+5:45
      const nptDate = new Date(time.getTime() + (5 * 60 + 45) * 60000 + time.getTimezoneOffset() * 60000);
      return {
        time: nptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        label: 'NEPAL (NPT +5:45)',
      };
    }
    if (clockMode === 'ist') {
      // India is UTC+5:30
      const istDate = new Date(time.getTime() + (5 * 60 + 30) * 60000 + time.getTimezoneOffset() * 60000);
      return {
        time: istDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        label: 'INDIA (IST +5:30)',
      };
    }
    return {
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      label: 'LOCAL TIME',
    };
  };

  const formatted = getFormattedTime();

  const cycleClock = () => {
    soundEffects.playClick();
    if (clockMode === 'local') setClockMode('npt');
    else if (clockMode === 'npt') setClockMode('ist');
    else if (clockMode === 'ist') setClockMode('utc');
    else setClockMode('local');
  };

  return (
    <header className="w-full bg-[#070c16]/90 backdrop-blur border-b border-cyan-500/20 px-4 py-2.5 flex items-center justify-between z-20">
      {/* Brand & Subsystem ID */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
          <h1 className="font-hud text-lg sm:text-xl font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
            REZA <span className="text-[10px] sm:text-xs text-cyan-600 font-mono tracking-normal border border-cyan-800/60 px-1.5 py-0.5 rounded">v2.5 // JARVIS-CORE</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-cyan-900/50 text-xs font-mono text-cyan-300/70">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> SECURITY: NOMINAL
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-sky-400">
            <Cpu className="w-3.5 h-3.5" /> CPU: {cpuUsage}%
          </span>
        </div>
      </div>

      {/* World Clock HUD */}
      <div 
        onClick={cycleClock}
        className="cursor-pointer group flex items-center space-x-2 bg-[#091424] hover:bg-[#0c1c33] border border-cyan-900/60 hover:border-cyan-500/50 px-3 py-1 rounded-md transition-colors"
        title="Click to toggle Local / Nepal (NPT) / India (IST) / UTC clock"
      >
        <Activity className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
        <div className="text-right">
          <div className="font-mono text-sm sm:text-base font-bold text-cyan-300 leading-none">
            {formatted.time}
          </div>
          <div className="text-[9px] font-mono text-cyan-500/80 uppercase tracking-wider">
            {formatted.label}
          </div>
        </div>
      </div>

      {/* Language, Audio, Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Sound FX Toggle */}
        <button
          onClick={onToggleSoundEffects}
          className={`p-1.5 rounded border text-xs flex items-center transition-all ${
            soundEffectsEnabled
              ? 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30 hover:bg-cyan-900/50'
              : 'border-slate-800 text-slate-500 bg-slate-900/40'
          }`}
          title={soundEffectsEnabled ? 'Mute SFX' : 'Enable SFX'}
        >
          {soundEffectsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Language Quick Selector */}
        <div className="flex items-center bg-[#091424] border border-cyan-900/60 rounded p-0.5 text-xs font-mono">
          <Globe className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-1 hidden sm:inline" />
          <button
            onClick={() => { soundEffects.playClick(); onLanguageChange('en'); }}
            className={`px-2 py-0.5 rounded transition-all ${
              currentLanguage === 'en' 
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]' 
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => { soundEffects.playClick(); onLanguageChange('hi'); }}
            className={`px-2 py-0.5 rounded transition-all ${
              currentLanguage === 'hi' 
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]' 
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => { soundEffects.playClick(); onLanguageChange('ne'); }}
            className={`px-2 py-0.5 rounded transition-all ${
              currentLanguage === 'ne' 
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]' 
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            नेपाली
          </button>
        </div>
      </div>
    </header>
  );
};
