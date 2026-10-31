import React from 'react';
import { createPortal } from 'react-dom';
import { PlayCircle, X } from 'lucide-react';
import VisualizerFrame from '../../../components/VisualizerFrame';
import { apiUrl } from '../../../config';
import { getStoredToken } from '../../../utils/auth';
import type { VisualizerAlgorithm } from '../../../data/visualizers';

export interface VisualizerPreviewModalProps {
  isOpen: boolean;
  visualizer: VisualizerAlgorithm | null;
  onClose: () => void;
}

export const VisualizerPreviewModal: React.FC<VisualizerPreviewModalProps> = ({
  isOpen,
  visualizer,
  onClose,
}) => {
  if (!isOpen || !visualizer) return null;

  const token = getStoredToken();
  const rawRenderUrl = visualizer.renderUrl
    ? apiUrl(visualizer.renderUrl)
    : apiUrl(`/api/visualizers/render/${visualizer.slug}`);
  const cacheKey = visualizer.updatedAt
    ? new Date(visualizer.updatedAt).getTime()
    : visualizer.fileChecksum || Date.now();
  const separator = rawRenderUrl.includes('?') ? '&' : '?';
  const withCacheBuster = `${rawRenderUrl}${separator}v=${cacheKey}`;
  const previewSrc = token
    ? `${withCacheBuster}&token=${encodeURIComponent(token)}`
    : withCacheBuster;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="surface my-auto max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-3xl flex flex-col shadow-2xl border border-[var(--border-strong)]">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <PlayCircle size={18} className="text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Preview: {visualizer.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-hidden flex-1 flex flex-col min-h-0">
          <VisualizerFrame
            key={`${visualizer.slug}-${cacheKey}`}
            src={previewSrc}
            title={visualizer.name}
            status={visualizer.status}
            aspectRatio="video"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

