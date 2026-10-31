import React from 'react';
import {
  Boxes,
  Check,
  Code2,
  Eye,
  FileCode,
  FolderTree,
  LayoutDashboard,
  Lightbulb,
  PlayCircle,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { SearchBox, FilterChip } from './AdminUIPrimitives';
import type { VisualizerAlgorithm, VisualizerType } from '../../data/visualizers';
import type { R2StatusResponse } from '../../utils/visualizerApi';

export interface AdminVisualizersTabProps {
  r2Status: R2StatusResponse | null;
  r2Loading: boolean;
  refreshR2Status: () => void;
  visualizers: VisualizerAlgorithm[];
  filteredVisualizers: VisualizerAlgorithm[];
  visualizerSearch: string;
  setVisualizerSearch: (s: string) => void;
  setIsCategoryManagerOpen: (open: boolean) => void;
  openCreateVisualizer: (pillar?: VisualizerType) => void;
  visualizerPillarFilter: 'all' | 'algorithm' | 'data-structure' | 'problem';
  setVisualizerPillarFilter: (p: 'all' | 'algorithm' | 'data-structure' | 'problem') => void;
  visualizerCategoryFilter: string;
  setVisualizerCategoryFilter: (c: string) => void;
  availableCategoryNames: string[];
  pillarCategoryNames: string[];
  visualizerStats: { live: number; awaiting: number };
  visualizerStatusFilter: 'all' | 'available' | 'unavailable';
  setVisualizerStatusFilter: (s: 'all' | 'available' | 'unavailable') => void;
  algorithmVisualizers: VisualizerAlgorithm[];
  dataStructureVisualizers: VisualizerAlgorithm[];
  problemVisualizers: VisualizerAlgorithm[];
  groupedAlgorithms: Array<[string, VisualizerAlgorithm[]]>;
  groupedDataStructures: Array<[string, VisualizerAlgorithm[]]>;
  groupedProblems: Array<[string, VisualizerAlgorithm[]]>;
  onOpenReplaceFile: (vis: VisualizerAlgorithm) => void;
  onOpenPreview: (vis: VisualizerAlgorithm) => void;
  onOpenSettings: (vis: VisualizerAlgorithm) => void;
  onOpenCode: (vis: VisualizerAlgorithm) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDelete: (id: string) => void;
}

export const AdminVisualizersTab: React.FC<AdminVisualizersTabProps> = ({
  r2Status,
  r2Loading,
  refreshR2Status,
  visualizers,
  filteredVisualizers,
  visualizerSearch,
  setVisualizerSearch,
  setIsCategoryManagerOpen,
  openCreateVisualizer,
  visualizerPillarFilter,
  setVisualizerPillarFilter,
  visualizerCategoryFilter,
  setVisualizerCategoryFilter,
  availableCategoryNames,
  pillarCategoryNames,
  visualizerStats,
  visualizerStatusFilter,
  setVisualizerStatusFilter,
  algorithmVisualizers,
  dataStructureVisualizers,
  problemVisualizers,
  groupedAlgorithms,
  groupedDataStructures,
  groupedProblems,
  onOpenReplaceFile,
  onOpenPreview,
  onOpenSettings,
  onOpenCode,
  onToggleStatus,
  onDelete,
}) => {
  const renderVisualizerCard = (vis: VisualizerAlgorithm) => {
    const isDataStructure = vis.type === 'data-structure';
    const isProblem = vis.type === 'problem';
    const isLive = vis.status === 'available';

    return (
      <div
        key={vis.id}
        className="flex flex-col justify-between rounded-2xl border border-l-4 border-l-teal-500 border-slate-200/80 dark:border-white/10 hover:border-teal-500/50 bg-white dark:bg-[#111715] p-4 sm:p-5 transition-all duration-200 hover:shadow-lg gap-4"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-xl shrink-0 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              {isDataStructure ? (
                <Boxes size={18} />
              ) : isProblem ? (
                <Lightbulb size={18} />
              ) : (
                <Zap size={18} />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  {isDataStructure
                    ? 'Data Structure'
                    : isProblem
                    ? `Sheet Problem #${vis.problemId || ''}`
                    : 'Algorithm'}
                </span>

                <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  {vis.dataStructureType || vis.category}
                </span>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    vis.difficulty === 'Easy'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                      : vis.difficulty === 'Medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                  }`}
                >
                  {vis.difficulty}
                </span>
              </div>

              <h3
                className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate"
                title={vis.name}
              >
                {vis.name}
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold flex items-center gap-1.5 ${
                isLive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`}
              />
              {isLive ? 'Live in R2' : 'Awaiting HTML'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {vis.fileSize ? `${(vis.fileSize / 1024).toFixed(1)} KB` : 'No file'}
            </span>
          </div>
        </div>

        {/* Pillar Specific Body */}
        <div className="space-y-2.5">
          {isProblem && (
            <div className="rounded-xl border border-teal-500/20 bg-teal-500/[0.04] p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                <span className="flex items-center gap-1.5">
                  <Lightbulb size={13} />
                  Linked Sheet Problem #{vis.problemId}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                  {vis.problemTopic || vis.category}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                {vis.problemTitle || vis.name}
              </p>
            </div>
          )}

          {!isDataStructure && !isProblem && (
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-xl px-3 py-1.5">
              <span>
                Avg:{' '}
                <strong className="text-teal-600 dark:text-teal-400">
                  {vis.timeComplexity?.average || 'O(n)'}
                </strong>
              </span>
              <span>•</span>
              <span>
                Worst:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {vis.timeComplexity?.worst || 'O(n²)'}
                </strong>
              </span>
              <span>•</span>
              <span>
                Space:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {vis.spaceComplexity || 'O(1)'}
                </strong>
              </span>
            </div>
          )}

          {/* Description Snippet */}
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {vis.description || 'No description provided.'}
          </p>

          {/* Storage / File Info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
            <span className="flex items-center gap-1.5 truncate max-w-[280px] font-mono text-[10px]">
              <FileCode size={12} className="text-teal-500 shrink-0" />
              <span className="truncate">{vis.originalFileName || vis.r2Key || vis.htmlPath}</span>
            </span>
            <span className="shrink-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {vis.storageType === 'r2' ? 'Cloudflare R2' : 'Local'}
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
          {/* Main Upload / Replace Action */}
          <button
            type="button"
            onClick={() => onOpenReplaceFile(vis)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition ${
              !isLive
                ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                : 'border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20'
            }`}
            title="Upload / Replace standalone HTML animation"
          >
            <UploadCloud size={13} />
            <span>{!isLive ? 'Upload HTML' : 'Replace HTML'}</span>
          </button>

          {/* Secondary Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpenPreview(vis)}
              className="rounded-xl border border-slate-200/80 p-1.5 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 transition"
              title="Preview animation"
            >
              <Eye size={14} />
            </button>

            <button
              type="button"
              onClick={() => onOpenSettings(vis)}
              className="rounded-xl border border-slate-200/80 p-1.5 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 transition"
              title="Edit configuration & parameters"
            >
              <Settings size={14} />
            </button>

            <button
              type="button"
              onClick={() => onOpenCode(vis)}
              className="rounded-xl border border-slate-200/80 p-1.5 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 transition"
              title="Inspect HTML code"
            >
              <Code2 size={14} />
            </button>

            <button
              type="button"
              onClick={() => onToggleStatus(vis.id, vis.status)}
              className={`rounded-xl p-1.5 border transition ${
                isLive
                  ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                  : 'border-amber-500/30 text-amber-600 hover:bg-amber-500/10'
              }`}
              title={isLive ? 'Mark as Awaiting Code' : 'Mark as Live'}
            >
              <Check size={14} className={isLive ? 'opacity-100' : 'opacity-40'} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(vis.id)}
              className="rounded-xl border border-slate-200/80 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:border-white/10 dark:hover:bg-rose-950/20 transition"
              title="Delete visualizer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cloudflare R2 Persistent Storage Status Banner */}
      <div className="surface rounded-3xl p-5 border border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              !r2Status || r2Loading
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                : r2Status.configured && r2Status.status === 'connected'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : r2Status.configured && r2Status.status === 'error'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            <UploadCloud size={22} className={r2Loading ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cloudflare R2 Persistent Object Storage
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  !r2Status || r2Loading
                    ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30'
                    : r2Status.configured && r2Status.status === 'connected'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : r2Status.configured && r2Status.status === 'error'
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}
              >
                {!r2Status || r2Loading
                  ? 'Checking Status...'
                  : r2Status.configured && r2Status.status === 'connected'
                  ? 'Connected'
                  : r2Status.configured && r2Status.status === 'error'
                  ? 'Connection Error'
                  : 'Credentials Missing (Local Fallback Mode)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              {!r2Status || r2Loading
                ? 'Contacting server to verify Cloudflare R2 bucket connection...'
                : r2Status.configured && r2Status.status === 'connected'
                ? `R2 Bucket: ${r2Status.bucket} • All uploaded animations are saved to persistent S3 object storage.`
                : r2Status.configured && r2Status.status === 'error'
                ? `Failed connecting to R2 bucket "${r2Status.bucket}": ${r2Status.message}`
                : 'Configure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in server/.env to activate Cloudflare R2.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refreshR2Status}
          disabled={r2Loading}
          className="button-secondary text-xs font-semibold !py-2 !px-3.5 self-start md:self-auto flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw size={13} className={r2Loading ? 'animate-spin' : ''} />
          <span>Test R2 Connection</span>
        </button>
      </div>

      <section className="surface rounded-3xl p-6">
        {/* Master Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Visualizer Hub &amp; Animations
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {filteredVisualizers.length} / {visualizers.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage 3-pillar visualizers and upload standalone HTML animations to Cloudflare R2
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SearchBox
              value={visualizerSearch}
              onChange={setVisualizerSearch}
              placeholder="Search by name, tags, topic..."
            />

            <button
              type="button"
              onClick={() => setIsCategoryManagerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 transition"
            >
              <FolderTree size={14} className="text-teal-500 dark:text-teal-400" />
              <span>Categories ({availableCategoryNames.length})</span>
            </button>

            <button
              type="button"
              onClick={() => openCreateVisualizer()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#123b36] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0b2d29] dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 shadow-sm"
            >
              <Plus size={15} />
              <span>
                {visualizerPillarFilter === 'algorithm'
                  ? 'New Algorithm'
                  : visualizerPillarFilter === 'data-structure'
                  ? 'New Data Structure'
                  : visualizerPillarFilter === 'problem'
                  ? 'New Sheet Problem'
                  : 'New Visualizer'}
              </span>
            </button>
          </div>
        </div>

        {/* 3-Pillar Master Sub-Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* Pillar 1: Algorithms */}
          <button
            type="button"
            onClick={() => {
              setVisualizerPillarFilter('algorithm');
              setVisualizerCategoryFilter('All');
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              visualizerPillarFilter === 'algorithm'
                ? 'border-teal-500 bg-teal-500/10 dark:bg-teal-500/[0.08] shadow-md ring-1 ring-teal-500/50'
                : 'border-slate-200/80 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-xl ${
                    visualizerPillarFilter === 'algorithm'
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-200/60 dark:bg-white/10 text-teal-600 dark:text-teal-400'
                  }`}
                >
                  <Zap size={16} />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">1. Algorithms</span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300">
                {visualizers.filter((v) => !v.type || v.type === 'algorithm').length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
              Sorting, Searching, Graphs, DP
            </p>
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {
                  visualizers.filter(
                    (v) => (!v.type || v.type === 'algorithm') && v.status === 'available'
                  ).length
                }{' '}
                Live
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {
                  visualizers.filter(
                    (v) => (!v.type || v.type === 'algorithm') && v.status !== 'available'
                  ).length
                }{' '}
                Awaiting
              </span>
            </div>
          </button>

          {/* Pillar 2: Data Structures */}
          <button
            type="button"
            onClick={() => {
              setVisualizerPillarFilter('data-structure');
              setVisualizerCategoryFilter('All');
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              visualizerPillarFilter === 'data-structure'
                ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/[0.08] shadow-md ring-1 ring-indigo-500/50'
                : 'border-slate-200/80 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-xl ${
                    visualizerPillarFilter === 'data-structure'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-200/60 dark:bg-white/10 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  <Boxes size={16} />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  2. Data Structures
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                {visualizers.filter((v) => v.type === 'data-structure').length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
              Structures &amp; operations matrix
            </p>
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {visualizers.filter((v) => v.type === 'data-structure' && v.status === 'available').length}{' '}
                Live
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {visualizers.filter((v) => v.type === 'data-structure' && v.status !== 'available').length}{' '}
                Awaiting
              </span>
            </div>
          </button>

          {/* Pillar 3: Sheet Problems */}
          <button
            type="button"
            onClick={() => {
              setVisualizerPillarFilter('problem');
              setVisualizerCategoryFilter('All');
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              visualizerPillarFilter === 'problem'
                ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/[0.08] shadow-md ring-1 ring-amber-500/50'
                : 'border-slate-200/80 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-xl ${
                    visualizerPillarFilter === 'problem'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200/60 dark:bg-white/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <Lightbulb size={16} />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  3. Sheet Problems
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                {visualizers.filter((v) => v.type === 'problem').length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
              Solutions linked to sheet problems
            </p>
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {visualizers.filter((v) => v.type === 'problem' && v.status === 'available').length}{' '}
                Live
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {visualizers.filter((v) => v.type === 'problem' && v.status !== 'available').length}{' '}
                Awaiting
              </span>
            </div>
          </button>

          {/* Pillar 4: All Visualizers (Divided Overview) */}
          <button
            type="button"
            onClick={() => {
              setVisualizerPillarFilter('all');
              setVisualizerCategoryFilter('All');
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              visualizerPillarFilter === 'all'
                ? 'border-slate-500 bg-slate-500/10 dark:bg-white/[0.06] shadow-md ring-1 ring-slate-400/50'
                : 'border-slate-200/80 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-xl ${
                    visualizerPillarFilter === 'all'
                      ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <LayoutDashboard size={16} />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  All (Grouped)
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                {visualizers.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
              Master view separated by pillar
            </p>
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {visualizerStats.live} Live
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {visualizerStats.awaiting} Awaiting
              </span>
            </div>
          </button>
        </div>

        {/* Context Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
            {visualizerPillarFilter === 'data-structure' ? 'Family:' : 'Category:'}
          </span>

          <FilterChip
            label="All"
            active={visualizerCategoryFilter === 'All'}
            onClick={() => setVisualizerCategoryFilter('All')}
          />
          {pillarCategoryNames.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={visualizerCategoryFilter === cat}
              onClick={() => setVisualizerCategoryFilter(cat)}
            />
          ))}

          <span className="mx-1 self-center border-l border-slate-200/80 dark:border-white/10 h-4" />

          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
            Status:
          </span>
          <FilterChip
            label="All Status"
            active={visualizerStatusFilter === 'all'}
            onClick={() => setVisualizerStatusFilter('all')}
          />
          <FilterChip
            label="Live"
            active={visualizerStatusFilter === 'available'}
            onClick={() => setVisualizerStatusFilter('available')}
            color="emerald"
          />
          <FilterChip
            label="Awaiting Code"
            active={visualizerStatusFilter === 'unavailable'}
            onClick={() => setVisualizerStatusFilter('unavailable')}
            color="amber"
          />
        </div>

        {/* Main Content Area */}
        {filteredVisualizers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
            <PlayCircle size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No visualizers match your filters
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting search keywords or click &quot;+ New Visualizer&quot; to add one.
            </p>
          </div>
        ) : visualizerPillarFilter === 'all' ? (
          /* Master All View: Explicitly Divided into 3 Distinct Sections */
          <div className="space-y-8">
            {/* Section 1: Algorithms */}
            {algorithmVisualizers.length > 0 && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-teal-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                      <Zap size={16} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Pillar 1: Algorithm Visualizations
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold">
                      {algorithmVisualizers.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisualizerPillarFilter('algorithm')}
                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    View Only Algorithms →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {algorithmVisualizers.map(renderVisualizerCard)}
                </div>
              </div>
            )}

            {/* Section 2: Data Structures */}
            {dataStructureVisualizers.length > 0 && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Boxes size={16} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Pillar 2: Data Structures &amp; Operations
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                      {dataStructureVisualizers.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisualizerPillarFilter('data-structure')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Only Data Structures →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {dataStructureVisualizers.map(renderVisualizerCard)}
                </div>
              </div>
            )}

            {/* Section 3: Sheet Problems */}
            {problemVisualizers.length > 0 && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Lightbulb size={16} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Pillar 3: Sheet Problem Visual Solutions
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                      {problemVisualizers.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisualizerPillarFilter('problem')}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    View Only Sheet Problems →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {problemVisualizers.map(renderVisualizerCard)}
                </div>
              </div>
            )}
          </div>
        ) : visualizerPillarFilter === 'algorithm' ? (
          /* Dedicated Algorithms View: Grouped by Category */
          <div className="space-y-6">
            {groupedAlgorithms.map(([categoryName, items]) => (
              <div key={categoryName} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-2">
                  <Zap size={15} className="text-teal-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {categoryName}
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold">
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {items.map(renderVisualizerCard)}
                </div>
              </div>
            ))}
          </div>
        ) : visualizerPillarFilter === 'data-structure' ? (
          /* Dedicated Data Structures View: Grouped by Family */
          <div className="space-y-6">
            {groupedDataStructures.map(([familyName, items]) => (
              <div key={familyName} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-2">
                  <Boxes size={15} className="text-indigo-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {familyName} Data Structures
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {items.map(renderVisualizerCard)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Dedicated Sheet Problems View: Grouped by Topic */
          <div className="space-y-6">
            {groupedProblems.map(([topicName, items]) => (
              <div key={topicName} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-2">
                  <Lightbulb size={15} className="text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {topicName}
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {items.map(renderVisualizerCard)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

