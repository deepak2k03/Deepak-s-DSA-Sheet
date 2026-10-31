import React from 'react';
import { createPortal } from 'react-dom';
import { Check, Code2, Copy, ExternalLink, Loader2, Save, X } from 'lucide-react';
import { apiUrl } from '../../../config';
import { getStoredToken } from '../../../utils/auth';
import type { VisualizerAlgorithm } from '../../../data/visualizers';

export interface VisualizerCodeModalProps {
  isOpen: boolean;
  visualizer: VisualizerAlgorithm | null;
  filePath: string;
  code: string;
  setCode: (code: string) => void;
  saving: boolean;
  copied: boolean;
  setCopied: (copied: boolean) => void;
  onClose: () => void;
  onSave: () => void;
}

export const VisualizerCodeModal: React.FC<VisualizerCodeModalProps> = ({
  isOpen,
  visualizer,
  filePath,
  code,
  setCode,
  saving,
  copied,
  setCopied,
  onClose,
  onSave,
}) => {
  if (!isOpen || !visualizer) return null;

  const token = getStoredToken();
  const rawUrl = visualizer.renderUrl
    ? apiUrl(visualizer.renderUrl)
    : apiUrl(`/api/visualizers/render/${visualizer.slug}`);
  const streamUrl = token ? `${rawUrl}?token=${encodeURIComponent(token)}` : rawUrl;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(filePath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="surface my-auto max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-3xl flex flex-col shadow-2xl border border-[var(--border-strong)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
              <Code2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit HTML Code: {visualizer.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Saves directly to <code className="font-mono text-teal-500">{filePath}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPath}
              className="rounded-lg border border-[var(--border-strong)] px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-surface-hover)] flex items-center gap-1"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copied ? 'Copied Path' : 'Copy File Path'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Textarea Editor */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col space-y-3 min-h-0">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between shrink-0">
            <span>💡 Paste your HTML markup, CSS styles, and JS animation code directly below.</span>
            <a
              href={streamUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold underline hover:text-amber-200 flex items-center gap-1"
            >
              Open Animation <ExternalLink size={11} />
            </a>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full flex-1 rounded-xl border border-slate-700 bg-[#09090b] p-4 font-mono text-xs leading-relaxed text-[#fafafa] outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none overflow-y-auto"
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-4 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {code.length} characters
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-surface-hover)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-xl bg-[#123b36] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#0b2d29] disabled:opacity-70 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 flex items-center gap-1.5"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save Code
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

