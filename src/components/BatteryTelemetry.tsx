import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, BatteryWarning, Zap, PlugZap, RefreshCw, ShieldCheck } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface BatteryState {
  level: number; // 0 - 100
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  isSupported: boolean;
  lastUpdated: string;
}

export const BatteryTelemetry: React.FC = () => {
  const [battery, setBattery] = useState<BatteryState>({
    level: 100,
    charging: true,
    chargingTime: 0,
    dischargingTime: Infinity,
    isSupported: false,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let batteryManager: any = null;

    const updateBatteryInfo = (bm: any) => {
      const levelPercent = Math.round((bm.level ?? 1) * 100);
      setBattery({
        level: levelPercent,
        charging: bm.charging ?? true,
        chargingTime: bm.chargingTime ?? 0,
        dischargingTime: bm.dischargingTime ?? Infinity,
        isSupported: true,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    };

    const initBattery = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nav = navigator as any;
        if (typeof nav.getBattery === 'function') {
          batteryManager = await nav.getBattery();
          updateBatteryInfo(batteryManager);

          // Real-time Event Listeners for Battery Status API
          batteryManager.addEventListener('levelchange', () => updateBatteryInfo(batteryManager));
          batteryManager.addEventListener('chargingchange', () => {
            soundEffects.playConfirmation();
            updateBatteryInfo(batteryManager);
          });
          batteryManager.addEventListener('chargingtimechange', () => updateBatteryInfo(batteryManager));
          batteryManager.addEventListener('dischargingtimechange', () => updateBatteryInfo(batteryManager));
        } else {
          // Browser does not support getBattery (e.g. Safari / Firefox)
          setBattery((prev) => ({
            ...prev,
            isSupported: false,
            level: 88,
            charging: true,
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          }));
        }
      } catch (err) {
        console.warn('Battery Status API initialization warning:', err);
        setBattery((prev) => ({
          ...prev,
          isSupported: false,
          level: 90,
          charging: true,
        }));
      }
    };

    initBattery();

    return () => {
      if (batteryManager) {
        try {
          batteryManager.removeEventListener('levelchange', () => {});
          batteryManager.removeEventListener('chargingchange', () => {});
        } catch {}
      }
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    soundEffects.playProcessingPulse();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      if (typeof nav.getBattery === 'function') {
        const bm = await nav.getBattery();
        const levelPercent = Math.round((bm.level ?? 1) * 100);
        setBattery({
          level: levelPercent,
          charging: bm.charging ?? true,
          chargingTime: bm.chargingTime ?? 0,
          dischargingTime: bm.dischargingTime ?? Infinity,
          isSupported: true,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        });
      }
    } catch {}
    setTimeout(() => {
      setIsRefreshing(false);
      soundEffects.playConfirmation();
    }, 600);
  };

  // Color logic
  const isCritical = battery.level <= 20 && !battery.charging;
  const isWarning = battery.level <= 35 && !battery.charging;
  const barColor = battery.charging
    ? 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]'
    : isCritical
    ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'
    : isWarning
    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
    : 'bg-emerald-400 shadow-[0_0_8px_#34d399]';

  const textColor = battery.charging
    ? 'text-cyan-300'
    : isCritical
    ? 'text-rose-400 font-bold'
    : isWarning
    ? 'text-amber-300'
    : 'text-emerald-300';

  return (
    <div className="w-full rounded-xl bg-[#050c18] border border-cyan-900/60 p-3 font-mono text-xs space-y-2.5 shadow-[0_0_15px_rgba(0,240,255,0.06)] relative overflow-hidden">
      {/* Background futuristic grid accent */}
      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

      {/* Header with Title and Refresh */}
      <div className="flex items-center justify-between border-b border-cyan-950 pb-1.5">
        <div className="flex items-center space-x-1.5">
          {battery.charging ? (
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 animate-pulse" />
          ) : isCritical ? (
            <BatteryWarning className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
          ) : (
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="font-hud font-bold text-cyan-400 text-[11px] tracking-wider uppercase">
            POWER TELEMETRY
          </span>
        </div>

        <button
          onClick={handleManualRefresh}
          className="text-cyan-600 hover:text-cyan-300 p-0.5 rounded transition-colors cursor-pointer"
          title="Poll Browser Battery Status API"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Main Metric Reading: Large Percentage & State */}
      <div className="flex items-baseline justify-between pt-0.5">
        <div className="flex items-baseline space-x-1">
          <span className={`text-2xl font-bold font-mono tracking-tight ${textColor}`}>
            {battery.level}%
          </span>
          <span className="text-[10px] text-slate-500 uppercase">Capacity</span>
        </div>

        <div className="text-right">
          <div className="flex items-center space-x-1 justify-end">
            {battery.charging ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-bold flex items-center gap-1">
                <PlugZap className="w-3 h-3 text-cyan-400" /> AC CHARGING
              </span>
            ) : (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                isCritical 
                  ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                  : 'bg-slate-900 text-slate-300 border border-slate-700'
              }`}>
                BATTERY POWER
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-[#081220] h-2 rounded-full overflow-hidden p-0.5 border border-cyan-950">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${Math.max(5, Math.min(100, battery.level))}%` }}
          />
        </div>

        {/* 5-segment ticks */}
        <div className="flex justify-between text-[9px] text-cyan-800 font-mono px-0.5">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Diagnostics details */}
      <div className="pt-1 border-t border-cyan-950/80 grid grid-cols-2 gap-1 text-[10px] text-slate-400">
        <div>
          <span className="text-slate-500">API STATUS: </span>
          <span className={battery.isSupported ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
            {battery.isSupported ? 'LIVE API' : 'DEVICE EMULATED'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-500">UPDATED: </span>
          <span className="text-cyan-400">{battery.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
};
