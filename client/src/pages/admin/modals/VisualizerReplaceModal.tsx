import React from 'react';
import { createPortal } from 'react-dom';
import { FileCode, Loader2, UploadCloud, X } from 'lucide-react';
import type { VisualizerAlgorithm } from '../../../data/visualizers';
import type { R2StatusResponse } from '../../../utils/visualizerApi';

export interface VisualizerReplaceModalProps {
  isOpen: boolean;
  visualizer: VisualizerAlgorithm | null;
  file: File | null;
  uploading: boolean;
  error: string | null;
  r2Status: R2StatusResponse | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (file: File | null) => void;
  onClose: () => void;
  onExecuteReplace: () => void;
}

export const VisualizerReplaceModal: React.FC<VisualizerReplaceModalProps> = ({
  isOpen,
  visualizer,
  file,
  uploading,
  error,
  r2Status,
  fileInputRef,
  onFileSelect,
  onClose,
  onExecuteReplace,
}) => {
  if (!isOpen || !visualizer) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="surface my-auto w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl p-6 shadow-2xl border border-[var(--border-strong)] flex flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <UploadCloud size={18} className="text-teal-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Upload HTML: {visualizer.name}
              </h3>
              <p className="text-[11px] font-mono text-teal-400">
                Target slug: {visualizer.slug}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload a standalone <code className="text-teal-400">.html</code> animation file for this algorithm. It will be stored persistently in{' '}
            {r2Status?.configured && r2Status.status === 'connected' ? (
              <strong className="text-white">Cloudflare R2</strong>
            ) : (
              'storage'
            )}
            .
          </p>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 p-6 text-center hover:border-teal-500 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              id="replace-file-picker"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                onFileSelect(f);
              }}
            />
            {file ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-left">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileCode size={20} className="text-teal-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB • HTML file
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      onFileSelect(null);
                    }}
                    className="text-slate-400 hover:text-rose-400 p-1"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-2.5 text-xs text-teal-300 text-left">
                  Ready to deploy <strong>{file.name}</strong> as the active animation for <strong>{visualizer.name}</strong>.
                </div>
              </div>
            ) : (
              <label htmlFor="replace-file-picker" className="cursor-pointer flex flex-col items-center gap-2">
                <UploadCloud size={28} className="text-teal-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Choose standalone HTML animation file
                </span>
                <span className="text-xs text-slate-400">
                  .html or .htm up to 5MB
                </span>
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="button-secondary text-xs font-semibold !py-2 !px-4"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!file || uploading}
            onClick={onExecuteReplace}
            className="button-primary text-xs font-semibold !py-2 !px-4 flex items-center gap-1.5 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud size={14} />
                <span>Upload &amp; Replace</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

