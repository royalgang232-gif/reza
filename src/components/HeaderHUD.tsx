import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { Volume2, VolumeX, Globe, ShieldCheck, Activity, Cpu, Radio, Bell, Download } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';
import { backgroundManager } from '../services/backgroundManager';

interface HeaderHUDProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  soundEffectsEnabled: boolean;
  onToggleSoundEffects: () => void;
  cpuUsage: number;
  backgroundActive: boolean;
  onToggleBackground: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  currentLanguage,
  onLanguageChange,
  soundEffectsEnabled,
  onToggleSoundEffects,
  cpuUsage,
  backgroundActive,
  onToggleBackground,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [clockMode, setClockMode] = useState<'local' | 'utc' | 'npt' | 'ist'>('local');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Capture beforeinstallprompt for Mobile & Laptop 1-click Install
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      soundEffects.playConfirmation();
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  const getFormattedTime = () => {
    if (clockMode === 'utc') {
      return {
        time: time.toUTCString().slice(17, 25),
        label: 'UTC TIME',
      };
    }
    if (clockMode === 'npt') {
      const nptDate = new Date(time.getTime() + (5 * 60 + 45) * 60000 + time.getTimezoneOffset() * 60000);
      return {
        time: nptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        label: 'NEPAL (NPT +5:45)',
      };
    }
    if (clockMode === 'ist') {
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
    <header className="w-full bg-[#070c16]/95 backdrop-blur border-b border-cyan-500/20 px-3 sm:px-4 py-2 flex items-center justify-between z-20">
      {/* Brand & Subsystem ID */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
          <h1 className="font-hud text-base sm:text-xl font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 sm:gap-2">
            REZA <span className="text-[10px] sm:text-xs text-cyan-600 font-mono tracking-normal border border-cyan-800/60 px-1.5 py-0.5 rounded">JARVIS-CORE</span>
          </h1>
        </div>

        {/* Background Operation Pill */}
        <button
          onClick={onToggleBackground}
          className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono transition-all cursor-pointer ${
            backgroundActive
              ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : 'bg-[#091526] border-cyan-950 text-slate-400 hover:text-cyan-300'
          }`}
          title="Toggle Background Assistant Mode (Keeps REZA running while you use other apps or lock screen)"
        >
          <Radio className={`w-3 h-3 ${backgroundActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span>{backgroundActive ? 'BACKGROUND: LIVE' : 'BG: OFF'}</span>
        </button>

        {/* Install to Mobile / Laptop button if installable */}
        {isInstallable && (
          <button
            onClick={handleInstallApp}
            className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-500 text-black font-bold text-[10px] shadow-[0_0_8px_#00f0ff] hover:bg-cyan-400 transition-colors cursor-pointer"
            title="Install REZA App to Mobile Home Screen or Laptop Desktop"
          >
            <Download className="w-3 h-3" />
            <span>Install App</span>
          </button>
        )}
      </div>

      {/* World Clock HUD */}
      <div 
        onClick={cycleClock}
        className="cursor-pointer group hidden sm:flex items-center space-x-2 bg-[#091424] hover:bg-[#0c1c33] border border-cyan-900/60 hover:border-cyan-500/50 px-2.5 py-1 rounded-md transition-colors"
        title="Click to toggle Local / Nepal (NPT) / India (IST) / UTC clock"
      >
        <Activity className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
        <div className="text-right">
          <div className="font-mono text-xs sm:text-sm font-bold text-cyan-300 leading-none">
            {formatted.time}
          </div>
          <div className="text-[8px] font-mono text-cyan-500/80 uppercase tracking-wider">
            {formatted.label}
          </div>
        </div>
      </div>

      {/* Language, Audio, Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
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
            className={`px-1.5 sm:px-2 py-0.5 rounded transition-all ${
              currentLanguage === 'en' 
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]' 
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => { soundEffects.playClick(); onLanguageChange('hi'); }}
            className={`px-1.5 sm:px-2 py-0.5 rounded transition-all ${
              currentLanguage === 'hi' 
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]' 
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => { soundEffects.playClick(); onLanguageChange('ne'); }}
            className={`px-1.5 sm:px-2 py-0.5 rounded transition-all ${
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
