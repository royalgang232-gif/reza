import React, { useState, useEffect } from 'react';
import { X, PenTool, Mic, MicOff, Copy, Check, Download, Trash2 } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { speechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';

interface DictationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
}

export const DictationModal: React.FC<DictationModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
}) => {
  const [dictatedText, setDictatedText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen && isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    }
  }, [isOpen, isRecording]);

  if (!isOpen) return null;

  const toggleRecording = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
      soundEffects.playStop();
    } else {
      soundEffects.playWakeChime();
      const started = speechService.startListening(
        (text, isFinal) => {
          if (isFinal) {
            setDictatedText((prev) => (prev ? prev + ' ' + text : text));
          }
        },
        (status) => {
          if (status === 'idle' || status === 'error') {
            setIsRecording(false);
          }
        }
      );
      if (started) {
        setIsRecording(true);
      }
    }
  };

  const insertPunctuation = (punct: string) => {
    soundEffects.playClick();
    setDictatedText((prev) => prev + punct);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dictatedText);
    setCopied(true);
    soundEffects.playConfirmation();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dictatedText.trim()) return;
    soundEffects.playConfirmation();
    const blob = new Blob([dictatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reza_dictation_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-2xl bg-[#070e1b] border border-cyan-500/40 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a1628] border-b border-cyan-900/60">
          <div className="flex items-center space-x-2 text-cyan-400 font-hud tracking-wider font-bold">
            <PenTool className="w-4 h-4 text-cyan-400" />
            <span>"REZA, WRITE THIS" // SPEECH-TO-TEXT DICTATION</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-cyan-950 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Controls Bar */}
          <div className="flex items-center justify-between bg-[#050c18] p-3 rounded-lg border border-cyan-900/60">
            <button
              onClick={toggleRecording}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white shadow-[0_0_15px_#f43f5e] animate-pulse'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_10px_#00f0ff]'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? 'Stop Dictating' : 'Start Dictating Voice'}</span>
            </button>

            <div className="text-xs text-cyan-500">
              Lang: <span className="font-bold text-cyan-300 uppercase">{currentLanguage}</span>
            </div>
          </div>

          {/* Quick Punctuation Bar */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs text-slate-400">
            <span className="text-[10px] text-cyan-600 mr-1">FORMAT:</span>
            {[
              { label: 'Period .', val: '. ' },
              { label: 'Comma ,', val: ', ' },
              { label: 'Question ?', val: '? ' },
              { label: 'Exclamation !', val: '! ' },
              { label: 'New Line ↵', val: '\n' },
              { label: 'Quotes ""', val: ' "" ' },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => insertPunctuation(p.val)}
                className="px-2 py-0.5 rounded bg-[#091526] hover:bg-cyan-950/60 border border-cyan-900/60 text-cyan-300 text-[11px] cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Editable Dictation Area */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">EDITABLE TRANSCRIPT BUFFER:</label>
            <textarea
              value={dictatedText}
              onChange={(e) => setDictatedText(e.target.value)}
              rows={10}
              placeholder="Dictated words will appear here in real time. You can also type, edit, and punctuate manually..."
              className="w-full bg-[#040812] border border-cyan-900/80 focus:border-cyan-400 rounded-lg p-3 text-sm text-cyan-100 font-mono leading-relaxed focus:outline-none selection:bg-cyan-700/50"
            />
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-cyan-900/60 text-xs">
            <button
              onClick={() => {
                if (confirm('Clear dictation buffer?')) {
                  setDictatedText('');
                }
              }}
              disabled={!dictatedText}
              className="flex items-center space-x-1 text-slate-500 hover:text-rose-400 disabled:opacity-40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Buffer</span>
            </button>

            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                disabled={!dictatedText}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#091526] hover:bg-[#0f223d] border border-cyan-900 text-cyan-300 disabled:opacity-40 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={!dictatedText}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-40 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Document (.txt)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
