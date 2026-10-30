import React, { useState, useEffect } from 'react';
import { X, Activity, Cpu, HardDrive, Battery, ShieldCheck, RefreshCw, Terminal, Calculator, FileText, Globe } from 'lucide-react';
import { systemService } from '../services/systemService';
import { SystemMetrics } from '../types';
import { soundEffects } from '../services/soundEffects';

interface SystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchApp: (appName: string) => void;
}

export const SystemModal: React.FC<SystemModalProps> = ({
  isOpen,
  onClose,
  onLaunchApp,
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      updateMetrics();
    }
  }, [isOpen]);

  const updateMetrics = async () => {
    const data = await systemService.getSystemMetrics();
    setMetrics(data);
  };

  const handleRunSecurityCheck = () => {
    setIsScanning(true);
    soundEffects.playProcessingPulse();
    setScanMessage("Querying kernel security modules & inspecting active processes...");
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage("Security verification complete: 0 vulnerabilities found. Firewall active, memory isolated.");
      soundEffects.playConfirmation();
      updateMetrics();
    }, 1800);
  };

  if (!isOpen || !metrics) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-xl bg-[#070e1b] border border-cyan-500/40 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a1628] border-b border-cyan-900/60">
          <div className="flex items-center space-x-2 text-cyan-400 font-hud tracking-wider font-bold">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>COMPUTER TELEMETRY & HARDWARE DIAGNOSTICS</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-cyan-950 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* OS Banner */}
          <div className="p-3 rounded-lg bg-[#050c17] border border-cyan-900/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">HOST OPERATING SYSTEM:</span>{' '}
              <span className="text-cyan-200 font-bold">{metrics.osName}</span>
            </div>
            <div className="text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE ({metrics.networkType})
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* CPU */}
            <div className="p-3 rounded-lg bg-[#081220] border border-cyan-900/60 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU</span>
                <span className="text-[10px] text-cyan-500">{metrics.cpuCores} Cores</span>
              </div>
              <div className="text-xl font-bold text-cyan-300">{metrics.cpuUsage}%</div>
              <div className="w-full bg-[#050a12] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${metrics.cpuUsage}%` }} 
                />
              </div>
            </div>

            {/* RAM */}
            <div className="p-3 rounded-lg bg-[#081220] border border-cyan-900/60 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-cyan-400" /> RAM</span>
                <span className="text-[10px] text-cyan-500">{metrics.ramTotalGB} GB</span>
              </div>
              <div className="text-xl font-bold text-cyan-300">{metrics.ramUsedGB} GB</div>
              <div className="w-full bg-[#050a12] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${metrics.ramUsage}%` }} 
                />
              </div>
            </div>

            {/* DISK */}
            <div className="p-3 rounded-lg bg-[#081220] border border-cyan-900/60 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-cyan-400" /> DISK</span>
                <span className="text-[10px] text-cyan-500">{metrics.diskTotalGB} GB</span>
              </div>
              <div className="text-xl font-bold text-cyan-300">{metrics.diskUsedGB} GB</div>
              <div className="w-full bg-[#050a12] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.round((metrics.diskUsedGB / metrics.diskTotalGB) * 100)}%` }} 
                />
              </div>
            </div>

            {/* BATTERY */}
            <div className="p-3 rounded-lg bg-[#081220] border border-cyan-900/60 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1"><Battery className="w-3.5 h-3.5 text-cyan-400" /> BATT</span>
                <span className="text-[10px] text-cyan-500">{metrics.isCharging ? 'CHARGING' : 'DISCHARGE'}</span>
              </div>
              <div className="text-xl font-bold text-cyan-300">
                {metrics.batteryLevel !== null ? `${metrics.batteryLevel}%` : 'AC Power'}
              </div>
              <div className="w-full bg-[#050a12] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${metrics.batteryLevel ?? 100}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Security Guard & System Updates */}
          <div className="p-4 rounded-xl bg-[#091526] border border-cyan-900/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-200 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>INTEGRATED SYSTEM DEFENDER & AUDIT</span>
              </div>
              <button
                onClick={handleRunSecurityCheck}
                disabled={isScanning}
                className="flex items-center space-x-1.5 px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs rounded transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
                <span>{isScanning ? 'Auditing...' : 'Run Security Check'}</span>
              </button>
            </div>

            {scanMessage && (
              <div className="text-xs p-2 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/60 animate-in fade-in">
                {scanMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
              <div>• Firewall: <span className="text-emerald-400 font-bold">Active & Enforcing</span></div>
              <div>• Real-time Protection: <span className="text-emerald-400 font-bold">Guarded</span></div>
              <div>• OS Pending Updates: <span className="text-cyan-300 font-bold">None (Up to Date)</span></div>
              <div>• Last Verified Scan: <span className="text-cyan-300 font-bold">{metrics.securityStatus.lastScanDate}</span></div>
            </div>
          </div>

          {/* Authorized Desktop Application Launchers */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              AUTHORIZED DESKTOP APPLICATION LAUNCHERS
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'Browser', icon: Globe, action: () => onLaunchApp('browser') },
                { name: 'Calculator', icon: Calculator, action: () => onLaunchApp('calculator') },
                { name: 'Text Editor', icon: FileText, action: () => onLaunchApp('editor') },
                { name: 'Terminal', icon: Terminal, action: () => onLaunchApp('terminal') },
              ].map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.name}
                    onClick={() => {
                      soundEffects.playConfirmation();
                      app.action();
                    }}
                    className="flex items-center space-x-2 p-2.5 rounded-lg bg-[#060c18] hover:bg-[#0c1a30] border border-cyan-950 hover:border-cyan-500/50 text-cyan-300 text-xs transition-all cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>Launch {app.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
