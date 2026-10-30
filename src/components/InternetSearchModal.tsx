import React, { useState, useEffect } from 'react';
import { X, Search, Globe, ExternalLink, Sparkles, Compass, ArrowRight, Laptop, Smartphone } from 'lucide-react';
import { searchInternet, SearchResult } from '../services/searchService';
import { soundEffects } from '../services/soundEffects';

interface InternetSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResultAsPrompt: (query: string) => void;
  onSpeakText: (text: string) => void;
}

export const InternetSearchModal: React.FC<InternetSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResultAsPrompt,
  onSpeakText,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'James Webb Space Telescope findings',
    'Quantum computing breakthroughs 2026',
    'Kathmandu city guide & weather',
    'Mount Everest elevation history',
    'Python AI assistant architecture'
  ]);

  if (!isOpen) return null;

  const handleSearch = async (targetQuery?: string) => {
    const q = (targetQuery || query).trim();
    if (!q) return;
    setLoading(true);
    soundEffects.playProcessingPulse();

    try {
      const res = await searchInternet(q);
      setResult(res);
      soundEffects.playConfirmation();

      if (!recentSearches.includes(q)) {
        setRecentSearches(prev => [q, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-2xl bg-[#070e1b] border border-cyan-500/40 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a1628] border-b border-cyan-900/60">
          <div className="flex items-center space-x-2 text-cyan-400 font-hud tracking-wider font-bold">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>GLOBAL INTERNET SEARCH ENGINE (MOBILE & LAPTOP)</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-cyan-950 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Device Badge */}
          <div className="flex items-center justify-between p-2 rounded bg-[#050c18] border border-cyan-950 text-[11px] text-cyan-400">
            <div className="flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 text-cyan-400" />
              <span>Laptop Mode</span>
              <span>•</span>
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mobile PWA Sync</span>
            </div>
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE WEB PROXY
            </span>
          </div>

          {/* Search Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex space-x-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-500 absolute left-3 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any subject on the live web (e.g. quantum AI, geography, news)..."
                className="w-full bg-[#050c18] border border-cyan-900/80 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-2.5 text-xs text-cyan-100 placeholder-cyan-700/60 focus:outline-none"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-40"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Preset / Trending Searches */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-500" /> Suggested & Recent Searches:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(item);
                    handleSearch(item);
                  }}
                  className="px-2.5 py-1 rounded bg-[#091526] hover:bg-cyan-950/60 border border-cyan-900/60 text-cyan-300 text-xs transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Display */}
          {result && (
            <div className="p-4 rounded-xl bg-[#091526] border border-cyan-500/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-cyan-200">{result.title}</h3>
                  <div className="text-[10px] text-cyan-500 font-mono">
                    Source: {result.sourceName} • Status: {result.isLive ? 'Verified Live' : 'Cached'}
                  </div>
                </div>

                {result.sourceUrl && (
                  <a
                    href={result.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-200 bg-[#050b14] px-2.5 py-1 rounded border border-cyan-900 transition-colors"
                  >
                    <span>Open Web Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="text-xs text-cyan-100 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {result.snippet}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-cyan-900/60">
                <button
                  onClick={() => {
                    onSpeakText(result.snippet.slice(0, 300));
                  }}
                  className="px-3 py-1.5 rounded bg-[#050e1a] hover:bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs transition-colors cursor-pointer"
                >
                  Vocalize Summary
                </button>

                <button
                  onClick={() => {
                    onSelectResultAsPrompt(`Explain more about: ${result.title}. Here is context: ${result.snippet.slice(0, 200)}`);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <span>Ask REZA to Analyze This</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
