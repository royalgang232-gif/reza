import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { Volume2, Copy, Check, Terminal, Play, Sparkles, ShieldAlert, CloudSun } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface ChatPanelProps {
  messages: Message[];
  onSpeakText: (text: string) => void;
  onConfirmAction?: (actionId: string) => void;
  onCancelAction?: (actionId: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSpeakText,
  onConfirmAction,
  onCancelAction,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundEffects.playConfirmation();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-mono text-sm">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-cyan-700/80">
          <div className="w-16 h-16 rounded-full border border-cyan-800/40 flex items-center justify-center mb-3">
            <Sparkles className="w-8 h-8 text-cyan-600 animate-pulse" />
          </div>
          <p className="font-hud tracking-wider text-base text-cyan-400">REZA CORE NEURAL LINK ESTABLISHED</p>
          <p className="text-xs text-cyan-600 max-w-md mt-1">
            Voice or text commands available in English, Hindi (हिन्दी), and Nepali (नेपाली).
            Try asking for real-time weather, system status, code generation, or telling a joke.
          </p>
        </div>
      )}

      {messages.map((msg) => {
        const isReza = msg.sender === 'reza';
        const isSystem = msg.sender === 'system';

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${
              isReza ? 'items-start' : isSystem ? 'items-center' : 'items-end'
            } transition-all duration-200`}
          >
            {/* Sender and timestamp tag */}
            <div className="flex items-center space-x-2 text-[11px] text-cyan-600 mb-1 px-1">
              <span className={`font-bold ${isReza ? 'text-cyan-400' : isSystem ? 'text-amber-400' : 'text-slate-400'}`}>
                {isReza ? '◈ REZA' : isSystem ? '⚠ SYSTEM' : 'USER'}
              </span>
              <span>•</span>
              <span>{msg.timestamp}</span>
              {msg.isLiveInfo && (
                <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 px-1 rounded">
                  LIVE DATA
                </span>
              )}
            </div>

            {/* Bubble Container */}
            <div
              className={`max-w-2xl rounded-xl p-3.5 sm:p-4 border backdrop-blur ${
                isReza
                  ? 'bg-[#091526]/80 border-cyan-500/30 text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.05)]'
                  : isSystem
                  ? 'bg-amber-950/20 border-amber-600/40 text-amber-200'
                  : 'bg-cyan-950/40 border-cyan-700/50 text-cyan-200'
              }`}
            >
              {/* Main Message Text */}
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.text}
              </div>

              {/* Weather Data Card if attached */}
              {msg.weatherData && (
                <div className="mt-3 p-3 rounded-lg bg-[#050c17] border border-cyan-800/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{msg.weatherData.icon}</span>
                    <div>
                      <div className="font-bold text-base text-cyan-200">{msg.weatherData.city}</div>
                      <div className="text-xs text-cyan-400/80">{msg.weatherData.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-cyan-300">{msg.weatherData.temperature}°C</div>
                    <div className="text-[10px] text-cyan-600">Humidity: {msg.weatherData.humidity}% | Wind: {msg.weatherData.windSpeed} km/h</div>
                  </div>
                </div>
              )}

              {/* Code Snippet Card if attached */}
              {msg.codeSnippet && (
                <div className="mt-3 rounded-lg bg-[#03060c] border border-cyan-900 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#081220] border-b border-cyan-900/60 text-xs text-cyan-400">
                    <span className="flex items-center gap-1.5 font-bold uppercase">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      {msg.codeSnippet.language}
                    </span>
                    <button
                      onClick={() => copyToClipboard(msg.codeSnippet!.code, msg.id)}
                      className="flex items-center space-x-1 text-[11px] text-cyan-400 hover:text-cyan-200 p-1 rounded hover:bg-cyan-900/30 transition-all cursor-pointer"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 text-xs text-cyan-200 overflow-x-auto leading-normal selection:bg-cyan-700/50">
                    <code>{msg.codeSnippet.code}</code>
                  </pre>
                  {msg.codeSnippet.explanation && (
                    <div className="px-3 py-1.5 bg-[#050e1a] border-t border-cyan-950 text-[11px] text-cyan-400/80">
                      ℹ {msg.codeSnippet.explanation}
                    </div>
                  )}
                </div>
              )}

              {/* Action Confirmation Card if action is pending */}
              {msg.actionData && msg.actionData.status === 'pending' && (
                <div className="mt-3 p-3 rounded-lg bg-amber-950/40 border border-amber-500/50">
                  <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>CONFIRMATION REQUIRED</span>
                  </div>
                  <p className="text-xs text-amber-200/90 mb-3">{msg.actionData.details}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onConfirmAction?.(msg.id)}
                      className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer"
                    >
                      Authorize & Execute
                    </button>
                    <button
                      onClick={() => onCancelAction?.(msg.id)}
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Reza Speech Playback Button */}
              {isReza && (
                <div className="mt-2.5 pt-2 border-t border-cyan-950/80 flex items-center justify-between text-xs text-cyan-600">
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      onSpeakText(msg.text);
                    }}
                    className="flex items-center space-x-1 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Speak this response"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Vocalize</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(msg.text, msg.id + '-txt')}
                    className="hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {copiedId === msg.id + '-txt' ? '✓ Text Copied' : 'Copy Text'}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};
