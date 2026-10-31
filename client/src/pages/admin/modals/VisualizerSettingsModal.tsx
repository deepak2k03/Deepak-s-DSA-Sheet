import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Boxes,
  Check,
  Code2,
  ExternalLink,
  FileCode,
  Lightbulb,
  Loader2,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';
import { Input, TextArea, Select } from '../AdminUIPrimitives';
import { DATA_STRUCTURE_FAMILIES, type VisualizerAlgorithm, type VisualizerType } from '../../../data/visualizers';
import { createAdminVisualizerCategory, type VisualizerCategoryItem } from '../../../utils/visualizerApi';
import type { AdminProblem } from '../AdminProblemsTab';

export interface VisualizerFormState {
  name: string;
  slug: string;
  type: VisualizerType;
  dataStructureType: string;
  operations: Array<{
    name: string;
    timeComplexity: string;
    spaceComplexity?: string;
    description?: string;
  }>;
  problemId: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  timeBest: string;
  timeAverage: string;
  timeWorst: string;
  spaceComplexity: string;
  tags: string;
  keyConcepts: string;
  status: 'available' | 'unavailable';
  order: string;
}

export interface VisualizerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingVisualizerId: string | null;
  visualizerForm: VisualizerFormState;
  setVisualizerForm: React.Dispatch<React.SetStateAction<VisualizerFormState>>;
  saveVisualizer: (e: React.FormEvent) => void;
  availableCategoryNames: string[];
  setCategories: React.Dispatch<React.SetStateAction<VisualizerCategoryItem[]>>;
  problems: AdminProblem[];
  visualizers: VisualizerAlgorithm[];
  saving: boolean;
  selectedUploadFile: File | null;
  setSelectedUploadFile: (file: File | null) => void;
  onOpenReplaceFile: (vis: VisualizerAlgorithm) => void;
  onOpenCode: (vis: VisualizerAlgorithm) => void;
  setNotice?: (msg: string | null) => void;
}

export const VisualizerSettingsModal: React.FC<VisualizerSettingsModalProps> = ({
  isOpen,
  onClose,
  editingVisualizerId,
  visualizerForm,
  setVisualizerForm,
  saveVisualizer,
  availableCategoryNames,
  setCategories,
  problems,
  visualizers,
  saving,
  selectedUploadFile,
  setSelectedUploadFile,
  onOpenReplaceFile,
  onOpenCode,
  setNotice,
}) => {
  const [isChangingProblem, setIsChangingProblem] = useState(false);
  const [problemPickerSearch, setProblemPickerSearch] = useState('');
  const [problemPickerTopic, setProblemPickerTopic] = useState('All');
  const [problemPickerDifficulty, setProblemPickerDifficulty] = useState('All');

  // Operation editor
  const [newOpName, setNewOpName] = useState('');
  const [newOpTime, setNewOpTime] = useState('O(1)');
  const [newOpSpace, setNewOpSpace] = useState('O(1)');
  const [newOpDesc, setNewOpDesc] = useState('');

  // Category inline creation
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const minimalProblems = useMemo(() => {
    return problems.map((p) => ({
      id: p.problemNumber || Number(p.id) || p.id,
      title: p.title,
      topic: p.topic || 'General',
      difficulty: p.difficulty,
      link: p.link,
    }));
  }, [problems]);

  const minimalProblemTopics = useMemo(() => {
    const set = new Set<string>();
    minimalProblems.forEach((p) => {
      if (p.topic) set.add(p.topic);
    });
    return Array.from(set).sort();
  }, [minimalProblems]);

  const topicProblemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    minimalProblems.forEach((p) => {
      const top = p.topic || 'General';
      counts[top] = (counts[top] || 0) + 1;
    });
    return counts;
  }, [minimalProblems]);

  const filteredMinimalProblems = useMemo(() => {
    return minimalProblems.filter((p) => {
      if (problemPickerTopic !== 'All' && p.topic !== problemPickerTopic) return false;
      if (problemPickerDifficulty !== 'All' && p.difficulty !== problemPickerDifficulty) return false;
      if (problemPickerSearch.trim()) {
        const query = problemPickerSearch.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesId = String(p.id).includes(query);
        const matchesTopic = p.topic.toLowerCase().includes(query);
        if (!matchesTitle && !matchesId && !matchesTopic) return false;
      }
      return true;
    });
  }, [minimalProblems, problemPickerTopic, problemPickerDifficulty, problemPickerSearch]);

  const currentlyLinkedProblem = useMemo(() => {
    if (!visualizerForm.problemId) return null;
    return minimalProblems.find((p) => String(p.id) === String(visualizerForm.problemId)) || null;
  }, [minimalProblems, visualizerForm.problemId]);

  const handleSelectProblemForVisualizer = (selectedProblemId: string) => {
    const prob = minimalProblems.find((p) => String(p.id) === selectedProblemId);
    if (!prob) {
      setVisualizerForm((curr) => ({ ...curr, problemId: '' }));
      setIsChangingProblem(false);
      return;
    }
    const slugName = prob.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const derivedSlug = `problem-${prob.id}-${slugName}`;
    setVisualizerForm((curr) => ({
      ...curr,
      problemId: String(prob.id),
      name: curr.name ? curr.name : prob.title,
      slug: curr.slug ? curr.slug : derivedSlug,
      category: curr.category || prob.topic,
      difficulty: (prob.difficulty as 'Easy' | 'Medium' | 'Hard') || curr.difficulty,
    }));
    setIsChangingProblem(false);
  };

  const handleAddOperation = () => {
    if (!newOpName.trim()) return;
    setVisualizerForm((c) => ({
      ...c,
      operations: [
        ...(c.operations || []),
        {
          name: newOpName.trim(),
          timeComplexity: newOpTime.trim() || 'O(1)',
          spaceComplexity: newOpSpace.trim() || 'O(1)',
          description: newOpDesc.trim() || undefined,
        },
      ],
    }));
    setNewOpName('');
    setNewOpTime('O(1)');
    setNewOpSpace('O(1)');
    setNewOpDesc('');
  };

  const handleRemoveOperation = (idx: number) => {
    setVisualizerForm((c) => ({
      ...c,
      operations: c.operations.filter((_, i) => i !== idx),
    }));
  };

  const handleAddNewCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setCategorySubmitting(true);
    try {
      const created = await createAdminVisualizerCategory(trimmed);
      setCategories((prev) => {
        if (prev.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return prev;
        return [...prev, created];
      });
      setVisualizerForm((curr) => ({ ...curr, category: trimmed }));
      setNewCategoryName('');
      setIsCreatingNewCategory(false);
      if (setNotice) setNotice(`Category "${trimmed}" created and selected.`);
    } catch {
      setVisualizerForm((curr) => ({ ...curr, category: trimmed }));
      setNewCategoryName('');
      setIsCreatingNewCategory(false);
    } finally {
      setCategorySubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="surface my-auto w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl flex flex-col shadow-2xl border border-[var(--border-strong)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingVisualizerId
                  ? `Visualizer Configuration: ${visualizerForm.name || 'Visualizer'}`
                  : 'New Visualizer'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {editingVisualizerId
                  ? 'Configure parameters, operations, sheet problem links, status, and animation file'
                  : 'Create a new visualization (Algorithm, Data Structure, or Sheet Problem) and upload standalone HTML animation to Cloudflare R2'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Scrollable with Clean Grouped Sections */}
        <form
          id="visualizer-settings-modal-form"
          onSubmit={saveVisualizer}
          className="p-6 overflow-y-auto space-y-5 flex-1 text-left"
        >
          {/* Pillar Selection Segment */}
          <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Visualization Pillar
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select which of the 3 DSA pillars this visualizer belongs to
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 uppercase tracking-wider border border-teal-500/20">
                {visualizerForm.type === 'data-structure'
                  ? 'Data Structure'
                  : visualizerForm.type === 'problem'
                  ? 'Sheet Problem'
                  : 'Algorithm'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setVisualizerForm((c) => ({ ...c, type: 'algorithm' }))}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                  visualizerForm.type === 'algorithm'
                    ? 'border-teal-500 bg-teal-500/10 shadow-sm'
                    : 'border-slate-200/70 hover:border-slate-300 dark:border-white/5 dark:hover:border-white/10 bg-white dark:bg-white/[0.01]'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    visualizerForm.type === 'algorithm'
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                  }`}
                >
                  <Zap size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">1. Algorithm</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Sorting, Searching, Graphs, DP
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisualizerForm((c) => ({ ...c, type: 'data-structure' }))}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                  visualizerForm.type === 'data-structure'
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                    : 'border-slate-200/70 hover:border-slate-300 dark:border-white/5 dark:hover:border-white/10 bg-white dark:bg-white/[0.01]'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    visualizerForm.type === 'data-structure'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                  }`}
                >
                  <Boxes size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    2. Data Structure
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    DS &amp; all operations (Push, Pop, Insert...)
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisualizerForm((c) => ({ ...c, type: 'problem' }))}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                  visualizerForm.type === 'problem'
                    ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                    : 'border-slate-200/70 hover:border-slate-300 dark:border-white/5 dark:hover:border-white/10 bg-white dark:bg-white/[0.01]'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    visualizerForm.type === 'problem'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                  }`}
                >
                  <Lightbulb size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    3. Sheet Problem
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Solution animation for sheet problem
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* If Sheet Problem: Problem Picker */}
          {visualizerForm.type === 'problem' && (
            <div className="rounded-2xl border border-teal-500/30 bg-teal-500/[0.03] dark:bg-teal-500/5 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-teal-500/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <Lightbulb size={16} className="text-teal-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    Linked Sheet Problem
                  </h4>
                </div>
                <span className="text-[11px] text-teal-600/80 dark:text-teal-400/80">
                  Connects directly to sheet problem &amp; solution page
                </span>
              </div>

              {currentlyLinkedProblem && !isChangingProblem ? (
                <div className="rounded-2xl border border-teal-500/30 bg-white dark:bg-[#121917] p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="shrink-0 font-mono text-xs font-extrabold rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 px-2.5 py-1.5 shadow-2xs">
                        #{currentlyLinkedProblem.id}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                            {currentlyLinkedProblem.topic}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              currentlyLinkedProblem.difficulty === 'Easy'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                                : currentlyLinkedProblem.difficulty === 'Medium'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                            }`}
                          >
                            {currentlyLinkedProblem.difficulty}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {currentlyLinkedProblem.title}
                        </h5>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsChangingProblem(true)}
                        className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 flex items-center gap-1.5 transition"
                      >
                        <Search size={13} />
                        <span>Change Problem</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectProblemForVisualizer('')}
                        className="rounded-xl border border-slate-200/80 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:border-white/10 dark:hover:bg-rose-950/20 transition"
                        title="Unlink problem"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-teal-700/80 dark:text-teal-300/80 pt-2 border-t border-teal-500/15">
                    <span className="flex items-center gap-1">
                      <Check size={13} className="text-teal-500" />
                      Auto-populates title, slug, and topic from sheet
                    </span>
                    {currentlyLinkedProblem.link && (
                      <a
                        href={currentlyLinkedProblem.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:underline text-teal-600 dark:text-teal-400 font-medium"
                      >
                        <span>View Problem Link</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Search &amp; Select Problem from Sheet ({minimalProblems.length} available)
                    </label>
                    {currentlyLinkedProblem && (
                      <button
                        type="button"
                        onClick={() => setIsChangingProblem(false)}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline font-medium"
                      >
                        Cancel (Keep #{currentlyLinkedProblem.id})
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={problemPickerSearch}
                      onChange={(e) => setProblemPickerSearch(e.target.value)}
                      placeholder="Search by problem name (e.g. 2Sum, LRU...) or #ID..."
                      autoFocus={isChangingProblem}
                      className="w-full rounded-xl border border-teal-500/40 bg-white dark:bg-[#101614] pl-9 pr-9 py-2 text-sm text-slate-900 dark:text-white outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                    {problemPickerSearch && (
                      <button
                        type="button"
                        onClick={() => setProblemPickerSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <CustomSelect
                      size="sm"
                      value={problemPickerTopic}
                      onChange={setProblemPickerTopic}
                      options={[
                        {
                          value: 'All',
                          label: `All Topics (${minimalProblems.length})`,
                        },
                        ...minimalProblemTopics.map((top) => ({
                          value: top,
                          label: top,
                          badge: `${topicProblemCounts[top] || 0}`,
                          badgeColor: 'teal' as const,
                        })),
                      ]}
                      className="w-48 sm:w-56"
                    />

                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                      {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setProblemPickerDifficulty(diff)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            problemPickerDifficulty === diff
                              ? 'bg-white dark:bg-teal-500 text-slate-900 dark:text-[#08241f] shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>

                    <span className="text-[11px] text-slate-400 ml-auto font-medium">
                      Found {filteredMinimalProblems.length} problem
                      {filteredMinimalProblems.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 p-2">
                    {filteredMinimalProblems.length > 0 ? (
                      filteredMinimalProblems.map((prob) => {
                        const isSelected = String(prob.id) === String(visualizerForm.problemId);
                        return (
                          <button
                            key={prob.id}
                            type="button"
                            onClick={() => handleSelectProblemForVisualizer(String(prob.id))}
                            className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left transition-all ${
                              isSelected
                                ? 'bg-teal-500/15 border border-teal-500/40 text-teal-900 dark:text-teal-100 shadow-2xs'
                                : 'bg-white dark:bg-[#121917] border border-slate-200/60 dark:border-white/5 hover:border-teal-500/40 hover:bg-teal-500/[0.04]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="shrink-0 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                #{prob.id}
                              </span>
                              <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                                {prob.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                {prob.topic}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  prob.difficulty === 'Easy'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                                    : prob.difficulty === 'Medium'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                                }`}
                              >
                                {prob.difficulty}
                              </span>
                              <span
                                className={`text-xs font-bold px-2.5 py-0.5 rounded-md transition ${
                                  isSelected
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {isSelected ? 'Selected' : 'Link'}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                        <p>No sheet problems found matching &quot;{problemPickerSearch}&quot;.</p>
                        {(problemPickerSearch ||
                          problemPickerTopic !== 'All' ||
                          problemPickerDifficulty !== 'All') && (
                          <button
                            type="button"
                            onClick={() => {
                              setProblemPickerSearch('');
                              setProblemPickerTopic('All');
                              setProblemPickerDifficulty('All');
                            }}
                            className="button-secondary text-xs !py-1 !px-3 font-semibold"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* If Data Structure: Family and Operations Matrix */}
          {visualizerForm.type === 'data-structure' && (
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <Boxes size={16} className="text-indigo-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Data Structure Classification &amp; Operations
                  </h4>
                </div>
                <span className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80">
                  Operations matrix for this DS
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <CustomSelect
                    label="Data Structure Family"
                    value={visualizerForm.dataStructureType || 'Linear'}
                    onChange={(val) =>
                      setVisualizerForm((c) => ({ ...c, dataStructureType: val }))
                    }
                    options={DATA_STRUCTURE_FAMILIES.map((family) => ({
                      value: family,
                      label: family,
                    }))}
                  />
                </div>
              </div>

              {/* Operations Table / Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Supported Operations ({visualizerForm.operations?.length || 0})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Actions users can visualize in your HTML animation
                  </span>
                </div>

                {visualizerForm.operations && visualizerForm.operations.length > 0 ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {visualizerForm.operations.map((op, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121917] text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {op.name}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              Time: {op.timeComplexity}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                              Space: {op.spaceComplexity || 'O(1)'}
                            </span>
                          </div>
                          {op.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {op.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOperation(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition"
                          title="Remove operation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center rounded-xl border border-dashed border-slate-300 dark:border-white/10 text-xs text-slate-400">
                    No operations configured yet. Add operations below to show in the complexity matrix.
                  </div>
                )}

                {/* Add Operation Form */}
                <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    + Add Operation
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={newOpName}
                      onChange={(e) => setNewOpName(e.target.value)}
                      placeholder="Operation (e.g. Insert, Pop)"
                      className="w-full rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-600 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                    />
                    <input
                      type="text"
                      value={newOpTime}
                      onChange={(e) => setNewOpTime(e.target.value)}
                      placeholder="Time (e.g. O(1))"
                      className="w-full rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-indigo-600 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                    />
                    <input
                      type="text"
                      value={newOpSpace}
                      onChange={(e) => setNewOpSpace(e.target.value)}
                      placeholder="Space (e.g. O(1))"
                      className="w-full rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-indigo-600 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddOperation}
                      disabled={!newOpName.trim()}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus size={13} />
                      Add Op
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newOpDesc}
                    onChange={(e) => setNewOpDesc(e.target.value)}
                    placeholder="Operation description (e.g. Inserts element at head or tail)"
                    className="w-full rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-600 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 1: General Info */}
          <div className="rounded-2xl border border-slate-200/80 p-5 dark:border-white/10 space-y-4 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                {visualizerForm.type === 'data-structure'
                  ? 'Data Structure Details'
                  : visualizerForm.type === 'problem'
                  ? 'Problem Solution Details'
                  : '1. General Details'}
              </h4>
              <span className="text-[11px] text-slate-400">
                {visualizerForm.type === 'data-structure'
                  ? 'Structure identity & naming'
                  : visualizerForm.type === 'problem'
                  ? 'Problem solution identity'
                  : 'Primary algorithm identity'}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={
                  visualizerForm.type === 'data-structure'
                    ? 'Data Structure Name'
                    : visualizerForm.type === 'problem'
                    ? 'Problem Solution Title'
                    : 'Algorithm Name'
                }
                value={visualizerForm.name}
                onChange={(value) =>
                  setVisualizerForm((current) => ({ ...current, name: value }))
                }
                placeholder={
                  visualizerForm.type === 'data-structure'
                    ? 'e.g. Singly Linked List'
                    : visualizerForm.type === 'problem'
                    ? 'e.g. Largest Element Solution'
                    : 'e.g. Quick Sort'
                }
                required
              />

              <Input
                label="Slug"
                value={visualizerForm.slug}
                onChange={(value) =>
                  setVisualizerForm((current) => ({ ...current, slug: value }))
                }
                placeholder="auto-derived from name if empty"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Category
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewCategory((prev) => !prev)}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 flex items-center gap-1 transition"
                  >
                    <Plus size={12} />
                    {isCreatingNewCategory ? 'Pick Existing' : 'New Category'}
                  </button>
                </div>

                {isCreatingNewCategory ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewCategory();
                          }
                        }}
                        placeholder="e.g. Trees, Backtracking..."
                        autoFocus
                        className="w-full rounded-xl border border-teal-500/50 bg-[#fbfcfa] px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-teal-500/40 dark:bg-[#101614] dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        disabled={categorySubmitting || !newCategoryName.trim()}
                        className="shrink-0 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 shadow-sm"
                      >
                        {categorySubmitting ? <Loader2 size={13} className="animate-spin" /> : 'Set'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Creates category and assigns this algorithm.
                    </p>
                  </div>
                ) : (
                  <CustomSelect
                    placeholder="— Select Category —"
                    value={visualizerForm.category}
                    onChange={(val) => {
                      if (val === '__NEW__') {
                        setIsCreatingNewCategory(true);
                      } else {
                        setVisualizerForm((current) => ({ ...current, category: val }));
                      }
                    }}
                    options={[
                      ...availableCategoryNames.map((cat) => ({
                        value: cat,
                        label: cat,
                      })),
                      {
                        value: '__NEW__',
                        label: '+ Create New Category...',
                        isAction: true,
                      },
                    ]}
                  />
                )}
              </div>

              <Select
                label="Difficulty"
                value={visualizerForm.difficulty}
                onChange={(value) =>
                  setVisualizerForm((current) => ({
                    ...current,
                    difficulty: value as 'Easy' | 'Medium' | 'Hard',
                  }))
                }
                options={[
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' },
                ]}
              />

              <Select
                label="Runtime Status"
                value={visualizerForm.status}
                onChange={(value) =>
                  setVisualizerForm((current) => ({
                    ...current,
                    status: value as 'available' | 'unavailable',
                  }))
                }
                options={[
                  { value: 'available', label: 'Live (Ready)' },
                  { value: 'unavailable', label: 'Awaiting Code (Draft)' },
                ]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Display Order"
                type="number"
                value={visualizerForm.order}
                onChange={(value) =>
                  setVisualizerForm((current) => ({ ...current, order: value }))
                }
              />
              <Input
                label="Tags (comma-separated)"
                value={visualizerForm.tags}
                onChange={(value) =>
                  setVisualizerForm((current) => ({ ...current, tags: value }))
                }
                placeholder="Sorting, Divide and Conquer, Pivot"
              />
            </div>

            <TextArea
              label="Description"
              value={visualizerForm.description}
              onChange={(value) =>
                setVisualizerForm((current) => ({ ...current, description: value }))
              }
            />
          </div>

          {/* Section 2: Complexity Metrics */}
          <div className="rounded-2xl border border-slate-200/80 p-5 dark:border-white/10 space-y-3 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                2. Complexity Analysis
              </h4>
              <span className="text-[11px] text-slate-400">Time &amp; space complexity values</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Best Time
                </span>
                <input
                  type="text"
                  value={visualizerForm.timeBest}
                  onChange={(e) =>
                    setVisualizerForm((curr) => ({ ...curr, timeBest: e.target.value }))
                  }
                  placeholder="O(n log n)"
                  className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Average Time
                </span>
                <input
                  type="text"
                  value={visualizerForm.timeAverage}
                  onChange={(e) =>
                    setVisualizerForm((curr) => ({ ...curr, timeAverage: e.target.value }))
                  }
                  placeholder="O(n log n)"
                  className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Worst Time
                </span>
                <input
                  type="text"
                  value={visualizerForm.timeWorst}
                  onChange={(e) =>
                    setVisualizerForm((curr) => ({ ...curr, timeWorst: e.target.value }))
                  }
                  placeholder="O(n²)"
                  className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Space Complexity
                </span>
                <input
                  type="text"
                  value={visualizerForm.spaceComplexity}
                  onChange={(e) =>
                    setVisualizerForm((curr) => ({ ...curr, spaceComplexity: e.target.value }))
                  }
                  placeholder="O(log n)"
                  className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Standalone Animation File & Storage */}
          <div className="rounded-2xl border border-slate-200/80 p-5 dark:border-white/10 space-y-4 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                3. Animation File &amp; Storage
              </h4>
              <span className="text-[11px] text-slate-400">Standalone HTML document</span>
            </div>

            {editingVisualizerId ? (
              <div className="space-y-3">
                {(() => {
                  const targetVis = visualizers.find((v) => v.id === editingVisualizerId);
                  if (!targetVis) return null;
                  return (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white">
                            Current File:
                          </span>
                          <code className="font-mono text-xs text-teal-600 dark:text-teal-400 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">
                            {targetVis.r2Key || targetVis.htmlPath}
                          </code>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Storage: {targetVis.storageType === 'r2' ? 'Cloudflare R2 Bucket' : 'Local Disk'}
                          {targetVis.fileSize ? ` • ${(targetVis.fileSize / 1024).toFixed(1)} KB` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenReplaceFile(targetVis);
                          }}
                          className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 flex items-center gap-1.5 transition"
                        >
                          <UploadCloud size={13} />
                          Replace HTML File
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenCode(targetVis);
                          }}
                          className="rounded-xl border border-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 flex items-center gap-1.5 transition"
                        >
                          <Code2 size={13} />
                          Edit Code
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div>
                <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Attach Standalone HTML Animation File (Optional)
                </span>
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 p-4 text-center hover:border-teal-500 dark:hover:border-teal-400 transition-colors">
                  <input
                    type="file"
                    accept=".html,.htm"
                    id="visualizer-create-file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedUploadFile(file);
                    }}
                  />
                  {selectedUploadFile ? (
                    <div className="flex items-center justify-between bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-left">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileCode size={20} className="text-teal-400 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {selectedUploadFile.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(selectedUploadFile.size / 1024).toFixed(1)} KB • HTML document
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedUploadFile(null)}
                        className="text-slate-400 hover:text-rose-400 p-1 rounded-md"
                        title="Remove file"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="visualizer-create-file"
                      className="cursor-pointer flex flex-col items-center gap-1.5 py-2"
                    >
                      <UploadCloud size={24} className="text-teal-500 dark:text-teal-400" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Attach standalone .html animation
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Uploads directly to Cloudflare R2 (creates empty skeleton if omitted)
                      </span>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Key Concepts */}
          <div className="rounded-2xl border border-slate-200/80 p-5 dark:border-white/10 space-y-3 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                4. Educational Concepts
              </h4>
              <span className="text-[11px] text-slate-400">Key takeaway points for students</span>
            </div>

            <TextArea
              label="Key Concepts (one concept per line)"
              value={visualizerForm.keyConcepts}
              onChange={(value) =>
                setVisualizerForm((current) => ({ ...current, keyConcepts: value }))
              }
            />
          </div>
        </form>

        {/* Modal Sticky Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-4 shrink-0">
          <span className="text-xs text-slate-400">
            {editingVisualizerId
              ? 'Changes will be saved immediately to the database.'
              : 'New visualizer will appear in the catalog.'}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="visualizer-settings-modal-form"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123b36] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#0b2d29] disabled:opacity-70 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 shadow-sm"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : editingVisualizerId ? (
                <Save size={16} />
              ) : selectedUploadFile ? (
                <UploadCloud size={16} />
              ) : (
                <Plus size={16} />
              )}
              {editingVisualizerId
                ? 'Save Settings'
                : selectedUploadFile
                ? 'Create & Upload to Cloudflare R2'
                : 'Create Visualizer'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

