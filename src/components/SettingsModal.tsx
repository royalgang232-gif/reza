import React, { useState, useEffect } from 'react';
import { X, Settings, Volume2, Shield, Trash2, Key, Globe, Radio, Sparkles } from 'lucide-react';
import { AssistantSettings, SupportedLanguage } from '../types';
import { speechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AssistantSettings;
  onUpdateSettings: (newSettings: Partial<AssistantSettings>) => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearHistory,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (isOpen) {
      setVoices(speechService.getAvailableVoices());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-xl bg-[#070e1b] border border-cyan-500/40 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a1628] border-b border-cyan-900/60">
          <div className="flex items-center space-x-2 text-cyan-400 font-hud tracking-wider font-bold">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>REZA ASSISTANT CONFIGURATION & PREFERENCES</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-cyan-950 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto text-xs">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> INTERACTION LANGUAGE:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'en', label: 'English', desc: 'Default (en-US)' },
                { id: 'hi', label: 'हिन्दी', desc: 'Hindi (hi-IN)' },
                { id: 'ne', label: 'नेपाली', desc: 'Nepali (ne-NP)' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    soundEffects.playClick();
                    onUpdateSettings({ language: item.id as SupportedLanguage });
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    settings.language === item.id
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'border-cyan-950 bg-[#050c18] text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-[10px] text-cyan-600">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Speech Parameters */}
          <div className="p-4 rounded-xl bg-[#050c18] border border-cyan-950 space-y-3">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" /> SPEECH SYNTHESIS ENGINE:
            </div>

            {/* Voice dropdown */}
            {voices.length > 0 && (
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">DEVICE TTS VOICE:</label>
                <select
                  value={settings.selectedVoiceName}
                  onChange={(e) => {
                    onUpdateSettings({ selectedVoiceName: e.target.value });
                    speechService.setVoiceByName(e.target.value);
                  }}
                  className="w-full bg-[#081220] border border-cyan-900 rounded p-2 text-cyan-200 focus:outline-none"
                >
                  <option value="">Auto-select based on language</option>
                  {voices.map((v, i) => (
                    <option key={i} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Speed slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>SPEECH SPEED (RATE):</span>
                <span className="text-cyan-300 font-bold">{settings.voiceSpeed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={settings.voiceSpeed}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ voiceSpeed: val });
                  speechService.setVoiceSpeed(val);
                }}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* Audio & Recognition Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center space-x-2.5 p-3 rounded-lg bg-[#050c18] border border-cyan-950 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.continuousListening}
                onChange={(e) => onUpdateSettings({ continuousListening: e.target.checked })}
                className="accent-cyan-400"
              />
              <div>
                <div className="font-bold text-cyan-200">Continuous Listening</div>
                <div className="text-[10px] text-slate-500">Keep listening without repeated mic clicks</div>
              </div>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-lg bg-[#050c18] border border-cyan-950 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => onUpdateSettings({ soundEffects: e.target.checked })}
                className="accent-cyan-400"
              />
              <div>
                <div className="font-bold text-cyan-200">Futuristic Sound FX</div>
                <div className="text-[10px] text-slate-500">Audio feedback chimes and chirps</div>
              </div>
            </label>
          </div>

          {/* Privacy & History Management */}
          <div className="p-4 rounded-xl bg-[#050c18] border border-cyan-950 space-y-3">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> PRIVACY & MEMORY SAFEGUARDS:
            </div>

            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.historyEnabled}
                onChange={(e) => onUpdateSettings({ historyEnabled: e.target.checked })}
                className="accent-cyan-400"
              />
              <div>
                <div className="font-bold text-cyan-200">Enable Conversation Memory</div>
                <div className="text-[10px] text-slate-500">
                  Saves interactions locally. Sensitive passwords/tokens are always auto-filtered.
                </div>
              </div>
            </label>

            <button
              onClick={() => {
                if (confirm('Clear all conversation history? This cannot be undone.')) {
                  onClearHistory();
                  soundEffects.playConfirmation();
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 text-rose-300 rounded text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All History Log</span>
            </button>
          </div>

          {/* Server-Side AI Intelligence Status */}
          <div className="p-4 rounded-xl bg-[#050c18] border border-cyan-950 space-y-2">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> REZA SERVER-SIDE AI INTEGRATION:
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed">
              Gemini AI models (<span className="text-cyan-300 font-bold">gemini-3.8-flash</span> & <span className="text-cyan-300 font-bold">gemini-3.8-live</span>) execute securely via the backend proxy server.
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-emerald-400 font-bold pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SERVER GATEWAY: ACTIVE (NO CLIENT KEY REQUIRED)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
