import React, { useState } from 'react';
import { X, TerminalSquare, Download, Copy, Check, FileCode, CheckCircle2, ChevronRight, Layers, PlayCircle, ShieldCheck } from 'lucide-react';
import JSZip from 'jszip';
import { PYTHON_PROJECT_FILES, PythonProjectFile } from '../data/pythonProjectFiles';
import { soundEffects } from '../services/soundEffects';

interface PythonSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonSuiteModal: React.FC<PythonSuiteModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<PythonProjectFile>(PYTHON_PROJECT_FILES[0]);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [activeOS, setActiveOS] = useState<'windows' | 'linux' | 'macos'>('windows');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedFile(true);
    soundEffects.playConfirmation();
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleCopyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    soundEffects.playConfirmation();
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    soundEffects.playProcessingPulse();
    try {
      const zip = new JSZip();
      const folder = zip.folder("reza_assistant") || zip;

      PYTHON_PROJECT_FILES.forEach(f => {
        folder.file(f.name, f.content);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reza_python_assistant.zip`;
      a.click();
      URL.revokeObjectURL(url);
      soundEffects.playConfirmation();
    } catch (err) {
      console.error('ZIP generation error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-5xl h-[88vh] bg-[#070e1b] border border-cyan-500/50 rounded-xl shadow-[0_0_40px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a1628] border-b border-cyan-900/60 flex-shrink-0">
          <div className="flex items-center space-x-2 text-cyan-400 font-hud tracking-wider font-bold">
            <TerminalSquare className="w-5 h-5 text-cyan-400" />
            <span className="text-sm sm:text-base">REZA STANDALONE PYTHON DESKTOP SUITE</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-xs rounded-lg shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'Packaging...' : 'Download Full Project (.zip)'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-cyan-950 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body: 2 Columns */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: File Tree & Launch Guide */}
          <div className="w-full md:w-72 bg-[#050c18] border-r border-cyan-900/60 flex flex-col overflow-y-auto">
            <div className="p-3 text-[11px] text-cyan-500/80 font-bold tracking-wider uppercase border-b border-cyan-950">
              MODULE DIRECTORY ({PYTHON_PROJECT_FILES.length} FILES)
            </div>

            <div className="p-2 space-y-1">
              {PYTHON_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.name === file.name;
                return (
                  <button
                    key={file.name}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedFile(file);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'text-slate-400 hover:bg-[#0a162a] hover:text-cyan-200'
                    }`}
                  >
                    <span className="flex items-center space-x-2 truncate">
                      <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="truncate">{file.name}</span>
                    </span>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Quick OS Instructions Mini-Panel */}
            <div className="mt-auto p-3 border-t border-cyan-950 bg-[#040810] text-[11px] space-y-2">
              <div className="text-cyan-400 font-bold flex items-center gap-1">
                <PlayCircle className="w-3.5 h-3.5 text-cyan-400" /> QUICK LAUNCH
              </div>
              <div className="flex space-x-1">
                {(['windows', 'linux', 'macos'] as const).map(os => (
                  <button
                    key={os}
                    onClick={() => setActiveOS(os)}
                    className={`flex-1 py-1 rounded text-[10px] uppercase transition-colors cursor-pointer ${
                      activeOS === os ? 'bg-cyan-500 text-black font-bold' : 'bg-[#081220] text-slate-400'
                    }`}
                  >
                    {os}
                  </button>
                ))}
              </div>
              
              <div className="bg-[#02050a] p-2 rounded border border-cyan-950 text-[10px] text-cyan-300 relative group">
                {activeOS === 'windows' && `call setup_run.bat`}
                {activeOS === 'linux' && `chmod +x setup_run.sh && ./setup_run.sh`}
                {activeOS === 'macos' && `chmod +x setup_run.sh && ./setup_run.sh`}
                <button
                  onClick={() => {
                    const cmd = activeOS === 'windows' ? 'call setup_run.bat' : 'chmod +x setup_run.sh && ./setup_run.sh';
                    handleCopyCommand(cmd, 'cmd-quick');
                  }}
                  className="absolute right-1 top-1 p-1 text-slate-500 hover:text-cyan-300"
                  title="Copy command"
                >
                  {copiedCmd === 'cmd-quick' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Code Viewer */}
          <div className="flex-1 flex flex-col bg-[#03060c] overflow-hidden">
            {/* File Info Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#060e1c] border-b border-cyan-900/60 text-xs text-cyan-300 flex-shrink-0">
              <div className="flex items-center space-x-2 truncate">
                <span className="font-bold text-white">{selectedFile.name}</span>
                <span className="text-cyan-600 hidden sm:inline">•</span>
                <span className="text-slate-400 text-[11px] truncate hidden sm:inline">{selectedFile.description}</span>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1.5 px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded text-xs transition-colors cursor-pointer flex-shrink-0"
              >
                {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFile ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-cyan-100 leading-relaxed selection:bg-cyan-700/50">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
