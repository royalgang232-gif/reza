import React from 'react';
import { 
  CloudSun, 
  Search, 
  Activity, 
  Monitor, 
  PenTool, 
  Code2, 
  FolderGit2, 
  Settings, 
  TerminalSquare 
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface QuickActionsProps {
  onOpenWeather: () => void;
  onOpenSearch: () => void;
  onOpenSystem: () => void;
  onOpenScreen: () => void;
  onOpenDictation: () => void;
  onOpenCode: () => void;
  onOpenFiles: () => void;
  onOpenPythonSuite: () => void;
  onOpenSettings: () => void;
  activeModal: string | null;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenWeather,
  onOpenSearch,
  onOpenSystem,
  onOpenScreen,
  onOpenDictation,
  onOpenCode,
  onOpenFiles,
  onOpenPythonSuite,
  onOpenSettings,
  activeModal,
}) => {
  const items = [
    { id: 'weather', label: 'Weather', icon: CloudSun, action: onOpenWeather },
    { id: 'search', label: 'Live Search', icon: Search, action: onOpenSearch },
    { id: 'system', label: 'System Telemetry', icon: Activity, action: onOpenSystem },
    { id: 'screen', label: 'Screen Vision', icon: Monitor, action: onOpenScreen },
    { id: 'dictation', label: 'Dictation Pad', icon: PenTool, action: onOpenDictation },
    { id: 'code', label: 'Code & Jokes', icon: Code2, action: onOpenCode },
    { id: 'files', label: 'File Manager', icon: FolderGit2, action: onOpenFiles },
    { id: 'python', label: 'Python Suite', icon: TerminalSquare, action: onOpenPythonSuite, highlight: true },
    { id: 'settings', label: 'Settings', icon: Settings, action: onOpenSettings },
  ];

  return (
    <div className="w-full bg-[#060b14] border-b border-cyan-950 px-4 py-2 flex items-center justify-start sm:justify-center space-x-1.5 overflow-x-auto scrollbar-none z-10">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeModal === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              soundEffects.playClick();
              item.action();
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                : item.highlight
                ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-900/60'
                : 'bg-[#091322] hover:bg-[#0e1e35] text-cyan-300/80 hover:text-cyan-200 border border-cyan-900/40 hover:border-cyan-500/40'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : item.highlight ? 'text-indigo-400' : 'text-cyan-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
