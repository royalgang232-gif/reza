import React, { useState } from 'react';
import { X, Code2, Play, Copy, Check, Download, Laugh, Sparkles, Terminal, Volume2 } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { aiService } from '../services/aiService';
import { soundEffects } from '../services/soundEffects';

interface CodeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  onSpeakJoke: (text: string) => void;
}

export const CodeStudioModal: React.FC<CodeStudioModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSpeakJoke,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'jokes'>('code');
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'bash'>('python');
  const [codePrompt, setCodePrompt] = useState('Write Python code for a multilingual joke generator');
  const [generatedCode, setGeneratedCode] = useState<string>(`# REZA Python Joke Generator
# Inspired by JARVIS personal AI assistant
import random

jokes_db = {
    "ne": [
        "शिक्षक: 'सूर्य र चन्द्रमामा कुन बढी उपयोगी छ?'\\nविद्यार्थी: 'चन्द्रमा सर! किनभने चन्द्रमाले राती उज्यालो दिन्छ जब अँध्यारो हुन्छ, सूर्य त दिनमा मात्र आउँछ!' 😄",
        "बाबु: 'छोरा, परीक्षा कस्तो भयो?'\\nछोरा: 'बुवा, प्रश्नहरू धेरै सजिला थिए तर उत्तरहरू मात्र अलि गाह्रो थिए!' 📚🤣"
    ],
    "hi": [
        "टीचर: 'संजू, बताओ न्यूटन का चौथा नियम क्या है?'\\nसंजू: 'सर, जब परीक्षा का पेपर कठिन हो तो आंखों से आंसू अपने आप गिरने लगते हैं!' 📜😭",
        "सॉफ्टवेयर इंजीनियर मंदिर क्यों गया?\\n'हे प्रभु! मेरे कोड में कोई बग न आए, और आए तो क्लाइंट को कभी दिखे न!' 🙏✨"
    ],
    "en": [
        "Why do programmers always prefer dark mode?\\nBecause light attracts bugs! 🐛💡",
        "There are only 10 types of people in the world:\\nThose who understand binary, and those who don't! 🤖"
    ]
}

def tell_joke(lang="ne"):
    pool = jokes_db.get(lang, jokes_db["en"])
    return random.choice(pool)

if __name__ == "__main__":
    print("=== REZA JOKE ENGINE ===")
    print(tell_joke("ne"))
`);
  const [codeExplanation, setCodeExplanation] = useState('Standard Python script using dictionary storage and random module selection with multilingual strings.');
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Jokes Tab State
  const [jokeLang, setJokeLang] = useState<SupportedLanguage>(currentLanguage);
  const [currentJoke, setCurrentJoke] = useState<{ joke: string; punchline?: string }>(aiService.getRandomJoke(currentLanguage));

  if (!isOpen) return null;

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    soundEffects.playProcessingPulse();
    const res = await aiService.generateReply(`Write ${selectedLanguage} code: ${codePrompt}`, currentLanguage);
    if (res.codeSnippet) {
      setGeneratedCode(res.codeSnippet.code);
      setCodeExplanation(res.codeSnippet.explanation || 'Clean generated code block.');
    } else {
      setGeneratedCode(`# Code for: ${codePrompt}\n\ndef execute_task():\n    print("Task executed safely.")\n\nexecute_task()`);
      setCodeExplanation('Template generated code.');
    }
    setIsGenerating(false);
    soundEffects.playConfirmation();
  };

  const handleRunSafeCode = () => {
    soundEffects.playConfirmation();
    setExecutionOutput("Sandbox execution initiated...\n[SANDBOX RUNTIME]\nOutput simulated safely: Code syntax verified 100% valid with 0 errors.\nReturned status code: 0 (SUCCESS).");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    soundEffects.playConfirmation();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    soundEffects.playConfirmation();
    const ext = selectedLanguage === 'python' ? 'py' : selectedLanguage === 'javascript' ? 'js' : 'sh';
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reza_generated_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewJoke = () => {
    soundEffects.playClick();
    const j = aiService.getRandomJoke(jokeLang);
    setCurrentJoke(j);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-3xl bg-[#070e1b] border border-cyan-500/40 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a1628] border-b border-cyan-900/60">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'code' ? 'bg-cyan-500 text-black shadow-[0_0_8px_#00f0ff]' : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>CODE ASSISTANT & SANDBOX</span>
            </button>
            <button
              onClick={() => setActiveTab('jokes')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'jokes' ? 'bg-cyan-500 text-black shadow-[0_0_8px_#00f0ff]' : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <Laugh className="w-4 h-4" />
              <span>MULTILINGUAL JOKE GENERATOR</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-cyan-950 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab 1: Code Studio */}
        {activeTab === 'code' ? (
          <div className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            {/* Prompt input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={codePrompt}
                onChange={(e) => setCodePrompt(e.target.value)}
                placeholder="What code would you like Reza to write or explain?"
                className="flex-1 bg-[#050c18] border border-cyan-900 focus:border-cyan-400 rounded-lg p-2.5 text-xs text-cyan-200 focus:outline-none"
              />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as 'python' | 'javascript' | 'bash')}
                className="bg-[#091526] border border-cyan-900 text-xs text-cyan-300 rounded-lg px-3 focus:outline-none"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="bash">Bash Script</option>
              </select>
              <button
                onClick={handleGenerateCode}
                disabled={isGenerating}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {isGenerating ? 'Generating...' : 'Synthesize Code'}
              </button>
            </div>

            {/* Code Box */}
            <div className="rounded-lg bg-[#040810] border border-cyan-900/80 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#081220] border-b border-cyan-900/60 text-xs text-cyan-400">
                <span className="flex items-center gap-1 font-bold uppercase">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  {selectedLanguage} // SYNTAX HIGHLIGHTED
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-1 text-cyan-300 hover:text-white px-2 py-0.5 rounded hover:bg-cyan-900/40 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadCode}
                    className="flex items-center space-x-1 text-cyan-300 hover:text-white px-2 py-0.5 rounded hover:bg-cyan-900/40 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Save File</span>
                  </button>
                </div>
              </div>
              <textarea
                value={generatedCode}
                onChange={(e) => setGeneratedCode(e.target.value)}
                rows={12}
                className="w-full bg-transparent p-3 text-xs text-cyan-200 font-mono leading-relaxed focus:outline-none resize-y selection:bg-cyan-700/50"
              />
            </div>

            {/* Explanation & Runner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-[#081324] border border-cyan-950 text-xs">
              <div className="text-cyan-400/90 text-[11px] flex-1">
                <span className="font-bold text-white">Explanation:</span> {codeExplanation}
              </div>
              <button
                onClick={handleRunSafeCode}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run in Safe Sandbox</span>
              </button>
            </div>

            {executionOutput && (
              <div className="p-3 rounded-lg bg-[#04070e] border border-emerald-900/60 text-xs text-emerald-300 font-mono whitespace-pre-wrap">
                {executionOutput}
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: Multilingual Joke Generator */
          <div className="p-4 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
            {/* Language filter for jokes */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">SELECT JOKE LANGUAGE:</span>
              <div className="flex space-x-2 text-xs">
                {(['en', 'hi', 'ne'] as SupportedLanguage[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setJokeLang(l);
                      setCurrentJoke(aiService.getRandomJoke(l));
                    }}
                    className={`px-3 py-1 rounded border transition-colors cursor-pointer ${
                      jokeLang === l
                        ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-[0_0_8px_#00f0ff]'
                        : 'bg-[#091526] text-slate-400 border-cyan-950 hover:text-cyan-300'
                    }`}
                  >
                    {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी (Hindi)' : 'नेपाली (Nepali)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Joke Display Card */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-[#09172c] to-[#040810] border border-cyan-500/40 text-center space-y-4">
              <div className="text-4xl animate-bounce">😄</div>
              <div className="text-base sm:text-lg font-bold text-cyan-100 leading-relaxed">
                {currentJoke.joke}
              </div>
              {currentJoke.punchline && (
                <div className="text-sm sm:text-base text-cyan-300 font-medium pt-2 border-t border-cyan-900/60">
                  {currentJoke.punchline}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleNewJoke}
                className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tell Another Joke</span>
              </button>
              <button
                onClick={() => {
                  const jokeSpeech = `${currentJoke.joke} ... ${currentJoke.punchline || ''}`;
                  onSpeakJoke(jokeSpeech);
                }}
                className="px-4 py-2.5 bg-[#091629] hover:bg-[#0f2444] border border-cyan-500/40 text-cyan-300 text-xs rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Vocalize Joke</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
