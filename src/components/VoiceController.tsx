import React, { useState } from 'react';
import { Mic, MicOff, Square, Send, Sparkles, Radio } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface VoiceControllerProps {
  isListening: boolean;
  isSpeaking: boolean;
  onToggleListen: () => void;
  onStopSpeaking: () => void;
  onSendCommand: (cmd: string) => void;
  status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  continuousListening: boolean;
  onToggleContinuousListening: () => void;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  isListening,
  isSpeaking,
  onToggleListen,
  onStopSpeaking,
  onSendCommand,
  status,
  continuousListening,
  onToggleContinuousListening,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    soundEffects.playConfirmation();
    onSendCommand(inputText.trim());
    setInputText('');
  };

  const suggestions = [
    "Search anything on internet",
    "Weather in Kathmandu",
    "Tell a joke in Nepali",
    "Reza, write this",
    "Run system diagnostics",
    "Open calculator",
    "Enable background assistance"
  ];

  return (
    <div className="w-full bg-[#070d18]/95 border-t border-cyan-500/20 p-3 sm:p-4 backdrop-blur z-20">
      {/* Suggestions scroll list */}
      <div className="max-w-4xl mx-auto flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs font-mono">
        <span className="text-cyan-500/70 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> QUICK:
        </span>
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => {
              soundEffects.playClick();
              onSendCommand(sug);
            }}
            className="whitespace-nowrap px-2.5 py-1 rounded bg-[#0a1526] hover:bg-cyan-950/40 text-cyan-300/80 hover:text-cyan-200 border border-cyan-900/50 hover:border-cyan-500/50 transition-all cursor-pointer"
          >
            {sug}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto flex items-center space-x-2 sm:space-x-3 pt-1">
        {/* Main Microphone Button */}
        <button
          type="button"
          onClick={onToggleListen}
          className={`relative p-3 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white shadow-[0_0_20px_#f43f5e] animate-pulse ring-4 ring-rose-500/30'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]'
          }`}
          title={isListening ? "Stop Listening" : "Start Voice Listening"}
        >
          {isListening ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-cyan-300" />
          )}
        </button>

        {/* Text Input Console */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? "Listening... Speak your command now..."
                : "Instruct Reza (e.g., 'weather in Kathmandu', 'write python joke generator', 'check CPU')..."
            }
            className="w-full bg-[#0a1424] border border-cyan-900/60 focus:border-cyan-400 rounded-lg py-2.5 pl-4 pr-12 text-sm text-cyan-100 placeholder-cyan-700/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 font-mono transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-1.5 p-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-30 disabled:hover:bg-cyan-500 transition-all cursor-pointer"
            title="Execute Command"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Stop Speaking Button */}
        {isSpeaking && (
          <button
            type="button"
            onClick={onStopSpeaking}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-rose-950/60 border border-rose-500/60 text-rose-300 hover:bg-rose-900/80 transition-all font-mono text-xs cursor-pointer animate-pulse"
            title="Stop Speech Output"
          >
            <Square className="w-3.5 h-3.5 fill-rose-400" />
            <span className="hidden sm:inline font-bold">STOP</span>
          </button>
        )}

        {/* Continuous Listening Toggle */}
        <button
          type="button"
          onClick={onToggleContinuousListening}
          className={`hidden md:flex items-center space-x-1.5 px-2.5 py-2 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
            continuousListening
              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
              : 'bg-[#0a1424] border-cyan-900/40 text-slate-500 hover:text-slate-300'
          }`}
          title="Continuous voice listening without clicking mic repeatedly"
        >
          <Radio className={`w-3.5 h-3.5 ${continuousListening ? 'text-cyan-400 animate-spin' : ''}`} />
          <span>{continuousListening ? 'CONT: ON' : 'CONT: OFF'}</span>
        </button>
      </div>
    </div>
  );
};
