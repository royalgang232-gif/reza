import React, { useState } from 'react';
import { X, FolderGit2, Trash2, RotateCcw, AlertTriangle, Plus, HardDrive, FileCode, FileText, Film, Box } from 'lucide-react';
import { systemService } from '../services/systemService';
import { ManagedFile } from '../types';
import { soundEffects } from '../services/soundEffects';

interface FileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileManagerModal: React.FC<FileManagerModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'active' | 'trash'>('active');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showLargeOnly, setShowLargeOnly] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [, setRefreshKey] = useState(0);

  if (!isOpen) return null;

  const files = showLargeOnly 
    ? systemService.getLargeFiles(500)
    : systemService.getFiles(tab === 'trash');

  const filteredFiles = categoryFilter === 'all' 
    ? files 
    : files.filter(f => f.category === categoryFilter);

  const handleMoveToTrash = (id: string, name: string) => {
    if (confirm(`Move file "${name}" to Trash / Recycle Bin?`)) {
      systemService.moveFileToTrash(id);
      soundEffects.playConfirmation();
      setRefreshKey(k => k + 1);
    }
  };

  const handleRestore = (id: string, name: string) => {
    systemService.restoreFileFromTrash(id);
    soundEffects.playConfirmation();
    setRefreshKey(k => k + 1);
  };

  const handlePermanentDelete = (id: string, name: string) => {
    if (confirm(`WARNING: Permanently destroy "${name}"? This action cannot be reversed.`)) {
      systemService.permanentlyDeleteFile(id);
      soundEffects.playAlert();
      setRefreshKey(k => k + 1);
    }
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    systemService.createNewFile(newFileName.trim());
    soundEffects.playConfirmation();
    setNewFileName('');
    setIsCreating(false);
    setRefreshKey(k => k + 1);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'code': return <FileCode className="w-4 h-4 text-cyan-400" />;
      case 'media': return <Film className="w-4 h-4 text-pink-400" />;
      case 'system': return <Box className="w-4 h-4 text-amber-400" />;
      default: return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-3xl bg-[#070e1b] border border-cyan-500/40 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a1628] border-b border-cyan-900/60">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => { setTab('active'); setShowLargeOnly(false); }}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                tab === 'active' && !showLargeOnly ? 'bg-cyan-500 text-black shadow-[0_0_8px_#00f0ff]' : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              <span>ACTIVE WORKSPACE</span>
            </button>

            <button
              onClick={() => { setTab('trash'); setShowLargeOnly(false); }}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                tab === 'trash' ? 'bg-rose-600 text-white shadow-[0_0_8px_#f43f5e]' : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>RECYCLE BIN / TRASH</span>
            </button>

            <button
              onClick={() => setShowLargeOnly(!showLargeOnly)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer border ${
                showLargeOnly ? 'bg-amber-500 text-black border-amber-400' : 'bg-transparent text-amber-400 border-amber-500/40 hover:bg-amber-950/40'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>LARGE FILES (&gt;500MB)</span>
            </button>
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
          {/* Controls bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            {/* Filter buttons */}
            <div className="flex space-x-1">
              {['all', 'code', 'document', 'media', 'system'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded capitalize transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-cyan-950 border border-cyan-400 text-cyan-200'
                      : 'bg-[#091526] text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Create file button */}
            {tab === 'active' && (
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center space-x-1 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New File</span>
              </button>
            )}
          </div>

          {/* New file input form */}
          {isCreating && (
            <form onSubmit={handleCreateFile} className="flex space-x-2 p-3 bg-[#091526] rounded-lg border border-cyan-500/40">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="File name (e.g., automated_task.py, report.txt)..."
                className="flex-1 bg-[#040812] border border-cyan-900 rounded px-3 py-1.5 text-xs text-cyan-100 focus:outline-none"
                autoFocus
              />
              <button type="submit" className="px-3 py-1.5 bg-cyan-500 text-black font-bold text-xs rounded cursor-pointer">
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded cursor-pointer"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Files List */}
          <div className="border border-cyan-900/60 rounded-lg overflow-hidden divide-y divide-cyan-950">
            {filteredFiles.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No files found in this category.
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-[#060c18] hover:bg-[#0a162b] transition-colors text-xs"
                >
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(file.category)}
                    <div>
                      <div className="text-cyan-200 font-bold flex items-center gap-2">
                        {file.name}
                        {file.sizeMB >= 500 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700">
                            LARGE FILE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-cyan-600 font-mono">{file.path}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-slate-400 font-mono">
                      {file.sizeMB >= 1000 ? `${(file.sizeMB / 1024).toFixed(2)} GB` : `${file.sizeMB} MB`}
                    </span>

                    {tab === 'active' ? (
                      <button
                        onClick={() => handleMoveToTrash(file.id, file.name)}
                        className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                        title="Move to Recycle Bin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleRestore(file.id, file.name)}
                          className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-emerald-950/40 cursor-pointer"
                          title="Restore from Recycle Bin"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(file.id, file.name)}
                          className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/40 cursor-pointer"
                          title="Permanently Delete"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
