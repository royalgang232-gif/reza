import React, { useState } from 'react';
import { X, Monitor, Camera, Upload, Sparkles, Volume2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { aiService } from '../services/aiService';
import { soundEffects } from '../services/soundEffects';

interface ScreenVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeakAnalysis: (text: string) => void;
}

export const ScreenVisionModal: React.FC<ScreenVisionModalProps> = ({
  isOpen,
  onClose,
  onSpeakAnalysis,
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  const [instruction, setInstruction] = useState('Explain what is visible on this screen and identify buttons, windows, and error messages.');

  if (!isOpen) return null;

  // Capture live display using Screen Capture API
  const handleCaptureScreen = async () => {
    setIsCapturing(true);
    soundEffects.playProcessingPulse();
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' },
        audio: false,
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 1920;
          canvas.height = video.videoHeight || 1080;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            setCapturedImage(dataUrl);
            soundEffects.playConfirmation();
          }
          // Stop stream tracks
          stream.getTracks().forEach((track) => track.stop());
          setIsCapturing(false);
        }, 300);
      };
    } catch (err) {
      console.warn('Screen capture cancelled or denied:', err);
      setIsCapturing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCapturedImage(event.target.result);
        soundEffects.playConfirmation();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    if (!capturedImage) return;
    setIsAnalyzing(true);
    soundEffects.playProcessingPulse();
    const report = await aiService.analyzeScreen(capturedImage, instruction);
    setAnalysisReport(report);
    setIsAnalyzing(false);
    soundEffects.playConfirmation();
  };

  const presetInstructions = [
    "Explain what is visible on the screen",
    "Locate buttons, menus, and controls",
    "Identify any error message and suggest troubleshooting steps",
    "Guide me through computer tasks step by step"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-2xl bg-[#070e1b] border border-cyan-500/40 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a1628] border-b border-cyan-900/60">
          <div className="flex items-center space-x-2 text-cyan-400 font-hud tracking-wider font-bold">
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>SCREEN UNDERSTANDING & LIVE COMPUTER GUIDANCE</span>
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
          {/* Permission Transparency Notice */}
          <div className="p-3 rounded-lg bg-[#050e1c] border border-cyan-900/60 text-xs text-cyan-400/90 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-bold">Privacy Guard:</span> REZA captures screenshots strictly upon your explicit permission. No background continuous screen recording or unauthorized transmission takes place.
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCaptureScreen}
              disabled={isCapturing}
              className="flex-1 min-w-[200px] py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-bold text-xs rounded-lg flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{isCapturing ? 'Waiting for Screen Selection...' : 'Capture Active Screen / Window'}</span>
            </button>

            <label className="py-2.5 px-4 bg-[#091526] hover:bg-[#0e213b] border border-cyan-900/70 text-cyan-300 text-xs rounded-lg flex items-center space-x-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Upload Image</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Screenshot Preview */}
          {capturedImage ? (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border border-cyan-500/50 bg-black aspect-video max-h-56 flex items-center justify-center">
                <img src={capturedImage} alt="Screen Preview" className="w-full h-full object-contain" />
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-cyan-300 font-mono">
                  Captured Frame Ready
                </div>
              </div>

              {/* Instructions Picker */}
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-400 text-[11px] block">SELECT OR ENTER GUIDANCE PROMPT:</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {presetInstructions.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInstruction(p)}
                      className={`text-[11px] px-2 py-1 rounded border transition-colors cursor-pointer ${
                        instruction === p 
                          ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200' 
                          : 'border-cyan-950 bg-[#060c18] text-slate-400 hover:text-cyan-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="w-full bg-[#050c18] border border-cyan-900 focus:border-cyan-400 rounded p-2 text-xs text-cyan-200 focus:outline-none"
                />
              </div>

              {/* Run Analysis Button */}
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'Analyzing Visible UI & Structure...' : 'Analyze Screen with Vision AI'}</span>
              </button>
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-cyan-900/60 rounded-xl text-center space-y-2 text-cyan-700">
              <Monitor className="w-10 h-10 mx-auto text-cyan-600" />
              <p className="text-xs">No screenshot currently captured.</p>
              <p className="text-[11px] text-slate-500">
                Click "Capture Active Screen / Window" above to grant browser screen permission or upload an image.
              </p>
            </div>
          )}

          {/* Analysis Report Output */}
          {analysisReport && (
            <div className="p-4 rounded-xl bg-[#091526] border border-cyan-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs text-cyan-300 font-bold border-b border-cyan-900/60 pb-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  REZA VISION INTELLIGENCE REPORT
                </span>
                <button
                  onClick={() => onSpeakAnalysis(analysisReport)}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-200 cursor-pointer"
                  title="Speak Analysis Report"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Vocalize</span>
                </button>
              </div>

              <div className="text-xs text-cyan-100 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {analysisReport}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
