import React, { useState, useMemo, useCallback } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Youtube,
  PlayCircle,
  Link2,
  X,
  Search,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronRight,
  FolderTree,
  Filter,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import {
  Input,
  Select,
  SearchBox,
  FilterChip,
  PaginationBar,
} from './AdminUIPrimitives';
import {
  TOPIC_PILLARS,
  getPillarForTopicSlug,
  getTopicIcon,
  type TopicDefinition,
  type TopicPillarGroup,
} from '../../data/topics';
import type { PaginationData } from './AdminUsersTab';
import type { VisualizerAlgorithm } from '../../data/visualizers';
import { getCanonicalTopicSlug } from '../../utils/topics';

export interface AdminProblem {
  id: string;
  problemNumber: number;
  title: string;
  link: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  tutorialLink: string;
  githubLink: string;
  videoSolutionUrl: string;
  visualizerSlug?: string;
  hasVisualizer?: boolean;
  approaches: Array<{
    id: string;
    title: string;
    algorithm: string;
    timeComplexity: string;
    spaceComplexity: string;
    codeSnippets: Array<{ language: string; code: string }>;
  }>;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export interface ProblemFormState {
  problemNumber: string;
  title: string;
  link: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tutorialLink: string;
  solutionLink?: string;
  githubLink: string;
  videoSolutionUrl: string;
  visualizerSlug: string;
  approaches: Array<{
    id: string;
    title: string;
    algorithm: string;
    timeComplexity: string;
    spaceComplexity: string;
    codeSnippets: Array<{ language: string; code: string }>;
  }>;
}

interface AdminProblemsTabProps {
  problems: AdminProblem[];
  filteredProblems: AdminProblem[];
  topics: TopicDefinition[];
  visualizers: VisualizerAlgorithm[];
  problemForm: ProblemFormState;
  setProblemForm: React.Dispatch<React.SetStateAction<ProblemFormState>>;
  editingProblemId: string | null;
  setEditingProblemId: (id: string | null) => void;
  resetProblemForm: () => void;
  saveProblem: (e: React.FormEvent) => void;
  saving: boolean;
  setIsSolutionModalOpen: (open: boolean) => void;
  problemSearch: string;
  setProblemSearch: (s: string) => void;
  problemDifficultyFilter: string;
  setProblemDifficultyFilter: (d: string) => void;
  problemStatusFilter: string;
  setProblemStatusFilter: (s: string) => void;
  problemTopicFilter: string;
  setProblemTopicFilter: (t: string) => void;
  problemPageSize: number | 'all';
  setProblemPageSize: (size: number | 'all') => void;
  problemsPagination: PaginationData;
  setProblemsPagination: React.Dispatch<React.SetStateAction<PaginationData>>;
  isReorderingProblems: boolean;
  setIsReorderingProblems: (b: boolean) => void;
  saveProblemOrder: () => void;
  moveProblem: (id: string, direction: 'up' | 'down') => void;
  deleteProblem: (id: string) => void;
  restoreProblem: (id: string) => void;
  refreshing: boolean;
  loadAdminData: (refresh?: boolean) => void;
  onOpenCreateVisualizerForProblem: (problem: { id: number; title: string; topic: string; difficulty: string }) => void;
  onPreviewVisualizer: (slug: string) => void;
}

export const AdminProblemsTab: React.FC<AdminProblemsTabProps> = ({
  problems,
  filteredProblems,
  topics,
  visualizers,
  problemForm,
  setProblemForm,
  editingProblemId,
  setEditingProblemId,
  resetProblemForm,
  saveProblem,
  saving,
  setIsSolutionModalOpen,
  problemSearch,
  setProblemSearch,
  problemDifficultyFilter,
  setProblemDifficultyFilter,
  problemStatusFilter,
  setProblemStatusFilter,
  problemTopicFilter,
  setProblemTopicFilter,
  problemPageSize,
  setProblemPageSize,
  problemsPagination,
  setProblemsPagination,
  isReorderingProblems,
  setIsReorderingProblems,
  saveProblemOrder,
  moveProblem,
  deleteProblem,
  restoreProblem,
  refreshing,
  loadAdminData,
  onOpenCreateVisualizerForProblem,
  onPreviewVisualizer,
}) => {
  // Modal state for Add/Edit problem
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  // Sidebar topic search
  const [sidebarTopicSearch, setSidebarTopicSearch] = useState('');
  // Media filter: all, has_visualizer, needs_visualizer, has_video
  const [problemMediaFilter, setProblemMediaFilter] = useState<'all' | 'has_visualizer' | 'needs_visualizer' | 'has_video'>('all');
  // Collapsed states for pillars in sidebar
  const [collapsedPillars, setCollapsedPillars] = useState<Record<string, boolean>>({});

  const togglePillarCollapse = (pillarId: string) => {
    setCollapsedPillars((prev) => ({ ...prev, [pillarId]: !prev[pillarId] }));
  };

  // Group topics into pillars
  const pillarGroups = useMemo(() => {
    const q = sidebarTopicSearch.toLowerCase().trim();
    return TOPIC_PILLARS.map((pillar) => {
      const pillarTopics = topics.filter((t) => {
        const canonical = getCanonicalTopicSlug(t.slug || t.name);
        const matchesPillar = pillar.topicSlugs.includes(canonical);
        if (!matchesPillar) return false;
        if (!q) return true;
        return t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
      });
      const totalProblems = pillarTopics.reduce((sum, t) => sum + (t.problemCount || 0), 0);
      return {
        ...pillar,
        topics: pillarTopics,
        totalProblems,
      };
    });
  }, [topics, sidebarTopicSearch]);

  // Overall statistics
  const totalSheetProblems = useMemo(() => {
    return topics.reduce((sum, t) => sum + (t.problemCount || 0), 0);
  }, [topics]);

  // Currently active topic definition
  const activeTopic = useMemo(() => {
    if (!problemTopicFilter || problemTopicFilter === 'all') return null;
    return (
      topics.find((t) => {
        const tSlug = t.slug || t.name;
        return (
          tSlug.toLowerCase() === problemTopicFilter.toLowerCase() ||
          getCanonicalTopicSlug(tSlug) === getCanonicalTopicSlug(problemTopicFilter)
        );
      }) || null
    );
  }, [topics, problemTopicFilter]);

  const activePillar = useMemo(() => {
    if (!activeTopic) return null;
    return getPillarForTopicSlug(activeTopic.slug);
  }, [activeTopic]);

  // Index visualizers by problemId for reliable lookup
  const visualizerMapByProblemNumber = useMemo(() => {
    const map = new Map<number, VisualizerAlgorithm>();
    visualizers.forEach((v) => {
      if (v.problemId !== undefined && v.problemId !== null && String(v.problemId).trim() !== '') {
        map.set(Number(v.problemId), v);
      }
    });
    return map;
  }, [visualizers]);

  const problemHasVisualizer = useCallback(
    (p: AdminProblem): boolean => {
      if (p.hasVisualizer) return true;
      if (p.visualizerSlug && p.visualizerSlug.trim() !== '') return true;
      if (p.problemNumber && visualizerMapByProblemNumber.has(Number(p.problemNumber))) return true;
      return false;
    },
    [visualizerMapByProblemNumber]
  );

  const getProblemVisualizer = useCallback(
    (p: AdminProblem): VisualizerAlgorithm | null => {
      if (p.problemNumber && visualizerMapByProblemNumber.has(Number(p.problemNumber))) {
        return visualizerMapByProblemNumber.get(Number(p.problemNumber)) || null;
      }
      if (p.visualizerSlug) {
        return visualizers.find((v) => v.slug.toLowerCase() === p.visualizerSlug.toLowerCase()) || null;
      }
      return null;
    },
    [visualizers, visualizerMapByProblemNumber]
  );

  // Real-time visualizer stats for currently filtered topic
  const visualizerStatsForActiveTopic = useMemo(() => {
    let hasVis = 0;
    let needsVis = 0;
    let hasVid = 0;
    filteredProblems.forEach((p) => {
      if (problemHasVisualizer(p)) hasVis++;
      else needsVis++;
      if (p.tutorialLink || p.videoSolutionUrl) hasVid++;
    });
    return { hasVis, needsVis, hasVid };
  }, [filteredProblems, problemHasVisualizer]);

  // Filter problems for media (visualizer / video)
  const displayProblems = useMemo(() => {
    if (problemMediaFilter === 'all') return filteredProblems;
    return filteredProblems.filter((p) => {
      if (problemMediaFilter === 'has_visualizer') {
        return problemHasVisualizer(p);
      }
      if (problemMediaFilter === 'needs_visualizer') {
        return !problemHasVisualizer(p);
      }
      if (problemMediaFilter === 'has_video') {
        return Boolean(p.tutorialLink || p.videoSolutionUrl);
      }
      return true;
    });
  }, [filteredProblems, problemMediaFilter, problemHasVisualizer]);

  // Client-side pagination of displayed problems
  const paginatedProblems = useMemo(() => {
    if (problemPageSize === 'all') return displayProblems;
    const pageSize = typeof problemPageSize === 'number' ? problemPageSize : 20;
    const startIndex = (problemsPagination.page - 1) * pageSize;
    return displayProblems.slice(startIndex, startIndex + pageSize);
  }, [displayProblems, problemPageSize, problemsPagination.page]);

  const totalProblemPages = useMemo(() => {
    if (problemPageSize === 'all') return 1;
    const pageSize = typeof problemPageSize === 'number' ? problemPageSize : 20;
    return Math.max(Math.ceil(displayProblems.length / pageSize), 1);
  }, [displayProblems.length, problemPageSize]);

  // Active filter count (excluding active topic navigation)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (problemDifficultyFilter && problemDifficultyFilter !== 'all') count++;
    if (problemStatusFilter && problemStatusFilter !== 'all') count++;
    if (problemMediaFilter && problemMediaFilter !== 'all') count++;
    if (problemSearch.trim()) count++;
    return count;
  }, [problemDifficultyFilter, problemStatusFilter, problemMediaFilter, problemSearch]);

  const clearAllFilters = () => {
    setProblemDifficultyFilter('all');
    setProblemStatusFilter('all');
    setProblemMediaFilter('all');
    setProblemSearch('');
    setProblemsPagination((p) => ({ ...p, page: 1 }));
  };

  const handleOpenAddProblem = (preselectedTopic?: string) => {
    resetProblemForm();
    if (preselectedTopic) {
      setProblemForm((prev) => ({ ...prev, topic: preselectedTopic }));
    } else if (activeTopic) {
      setProblemForm((prev) => ({ ...prev, topic: activeTopic.slug }));
    }
    setIsProblemModalOpen(true);
  };

  const handleEditProblem = (problem: AdminProblem) => {
    setEditingProblemId(problem.id);
    setProblemForm({
      problemNumber: String(problem.problemNumber),
      title: problem.title,
      link: problem.link,
      topic: problem.topic,
      difficulty: problem.difficulty,
      tutorialLink: problem.tutorialLink || '',
      githubLink: problem.githubLink || '',
      videoSolutionUrl: problem.videoSolutionUrl || '',
      visualizerSlug: problem.visualizerSlug || '',
      approaches: problem.approaches ? JSON.parse(JSON.stringify(problem.approaches)) : [],
    });
    setIsProblemModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    await saveProblem(e);
    setIsProblemModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Master 2-Column Responsive Layout */}
      <section className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* ===================== LEFT COLUMN: CATEGORIZED TOPIC EXPLORER ===================== */}
        <aside className="surface rounded-3xl p-5 flex flex-col gap-4 self-start sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto border border-slate-200/80 dark:border-white/10 shadow-sm">
          {/* Sidebar Header */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                <FolderTree size={14} />
                <span>Topic Explorer</span>
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {topics.length} topics
              </span>
            </div>
            <h3 className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
              Curriculum Pillars
            </h3>
          </div>

          {/* Sidebar Topic Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={sidebarTopicSearch}
              onChange={(e) => setSidebarTopicSearch(e.target.value)}
              placeholder="Find topic..."
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            {sidebarTopicSearch && (
              <button
                type="button"
                onClick={() => setSidebarTopicSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Master "All Problems" Row */}
          <button
            type="button"
            onClick={() => {
              setProblemTopicFilter('all');
              setProblemsPagination((p) => ({ ...p, page: 1 }));
            }}
            className={`flex items-center justify-between rounded-2xl p-3 text-left transition ${
              !problemTopicFilter || problemTopicFilter === 'all'
                ? 'bg-[#123b36] text-white shadow-md dark:bg-teal-400 dark:text-[#08241f]'
                : 'border border-slate-200/80 bg-slate-50/80 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-200 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`rounded-xl p-1.5 ${
                  !problemTopicFilter || problemTopicFilter === 'all'
                    ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                    : 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                }`}
              >
                <Layers size={16} />
              </div>
              <div>
                <div className="text-xs font-bold leading-none">All Problems</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    !problemTopicFilter || problemTopicFilter === 'all'
                      ? 'text-white/80 dark:text-black/70'
                      : 'text-slate-400'
                  }`}
                >
                  Entire Sheet Catalog
                </div>
              </div>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-black ${
                !problemTopicFilter || problemTopicFilter === 'all'
                  ? 'bg-white/25 text-white dark:bg-black/25 dark:text-black'
                  : 'bg-slate-200/80 text-slate-700 dark:bg-white/10 dark:text-slate-300'
              }`}
            >
              {totalSheetProblems || problemsPagination.total}
            </span>
          </button>

          {/* 4 Pillars Hierarchy */}
          <div className="space-y-4">
            {pillarGroups.map((pillar) => {
              const isCollapsed = collapsedPillars[pillar.id] && !sidebarTopicSearch;
              const isPillarActive =
                activeTopic && pillar.topicSlugs.includes(getCanonicalTopicSlug(activeTopic.slug));

              return (
                <div
                  key={pillar.id}
                  className={`rounded-2xl border transition ${
                    isPillarActive
                      ? 'border-teal-500/40 bg-teal-500/[0.02]'
                      : 'border-slate-200/60 bg-transparent dark:border-white/5'
                  }`}
                >
                  {/* Pillar Section Header */}
                  <div
                    onClick={() => togglePillarCollapse(pillar.id)}
                    className="flex cursor-pointer items-center justify-between p-3 select-none hover:bg-slate-50/50 dark:hover:bg-white/[0.02] rounded-t-2xl transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        {pillar.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                        {pillar.totalProblems}
                      </span>
                      {isCollapsed ? (
                        <ChevronRight size={13} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={13} className="text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Topic Items in Pillar */}
                  {!isCollapsed && (
                    <div className="space-y-1 p-1.5 pt-0">
                      {pillar.topics.map((t) => {
                        const tSlug = t.slug || t.name;
                        const isCurrentActive =
                          problemTopicFilter === tSlug ||
                          problemTopicFilter === t.name ||
                          (problemTopicFilter !== 'all' &&
                            getCanonicalTopicSlug(problemTopicFilter) === getCanonicalTopicSlug(tSlug));
                        const count = t.problemCount ?? 0;

                        return (
                          <div
                            key={tSlug}
                            className="group relative flex items-center justify-between rounded-xl transition"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setProblemTopicFilter(tSlug);
                                setProblemsPagination((p) => ({ ...p, page: 1 }));
                              }}
                              className={`flex flex-1 items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition ${
                                isCurrentActive
                                  ? 'bg-[#123b36] font-bold text-white shadow-sm dark:bg-teal-400 dark:text-[#08241f]'
                                  : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate pr-2">
                                <span
                                  className={`${
                                    isCurrentActive
                                      ? 'text-white dark:text-[#08241f]'
                                      : 'text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                                  }`}
                                >
                                  {getTopicIcon(t.iconKey, 14)}
                                </span>
                                <span className="truncate">{t.name}</span>
                              </div>
                              <span
                                className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                                  isCurrentActive
                                    ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                                    : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'
                                }`}
                              >
                                {count}
                              </span>
                            </button>

                            {/* Hover Quick Add Action */}
                            <button
                              type="button"
                              onClick={() => handleOpenAddProblem(t.slug)}
                              title={`Quick add problem to ${t.name}`}
                              className="absolute right-1 opacity-0 group-hover:opacity-100 rounded-lg bg-teal-500 p-1 text-white shadow-sm hover:bg-teal-600 transition"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Add Problem Button at bottom of sidebar */}
          <button
            type="button"
            onClick={() => handleOpenAddProblem()}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#123b36] px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#0b2d29] dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 transition"
          >
            <Plus size={15} />
            <span>Create New Problem</span>
          </button>
        </aside>

        {/* ===================== RIGHT COLUMN: SPACIOUS PROBLEM MANAGEMENT HUB ===================== */}
        <div className="surface rounded-3xl p-6 flex flex-col gap-5 border border-slate-200/80 dark:border-white/10 shadow-sm min-w-0">
          {/* Hero Banner: Currently Selected Topic Context */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-slate-200/70 bg-gradient-to-r from-slate-50/80 to-teal-500/[0.03] p-5 dark:border-white/10 dark:from-white/[0.02] dark:to-teal-500/[0.05]">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-[#dceee9] p-3.5 text-[#123b36] shadow-sm dark:bg-teal-400/10 dark:text-teal-300">
                {activeTopic ? getTopicIcon(activeTopic.iconKey, 24) : <Layers size={24} />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {activeTopic ? activeTopic.name : 'All Sheet Problems'}
                  </h2>
                  {activePillar && (
                    <span className="rounded-full bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                      {activePillar.name}
                    </span>
                  )}
                  <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                    {displayProblems.length} problem{displayProblems.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                  {activeTopic?.description ||
                    'Comprehensive catalog of sheet problems with step-by-step approaches, video tutorials, and interactive algorithm visualizers.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-center">
              <button
                type="button"
                onClick={() => handleOpenAddProblem()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#123b36] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0b2d29] dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 transition"
              >
                <Plus size={15} />
                <span>Add Problem</span>
              </button>
            </div>
          </div>

          {/* Clean Horizontal Filter Toolbar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Search Box */}
              <div className="flex-1 max-w-md">
                <SearchBox
                  value={problemSearch}
                  onChange={(val) => {
                    setProblemSearch(val);
                    setProblemsPagination((p) => ({ ...p, page: 1 }));
                  }}
                  placeholder={activeTopic ? `Search in ${activeTopic.name} by title or #…` : 'Search problems by title or #…'}
                />
              </div>

              {/* Reset button if filters active */}
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 self-start lg:self-center rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 transition"
                >
                  <RotateCcw size={12} />
                  <span>Reset filters ({activeFiltersCount})</span>
                </button>
              )}
            </div>

            {/* Filter Chips Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
              {/* Difficulty Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                <FilterChip
                  label="All Difficulties"
                  active={!problemDifficultyFilter || problemDifficultyFilter === 'all'}
                  onClick={() => {
                    setProblemDifficultyFilter('all');
                    setProblemsPagination((p) => ({ ...p, page: 1 }));
                  }}
                />
                <FilterChip
                  label="Easy"
                  active={problemDifficultyFilter === 'Easy'}
                  onClick={() => {
                    setProblemDifficultyFilter('Easy');
                    setProblemsPagination((p) => ({ ...p, page: 1 }));
                  }}
                  color="emerald"
                />
                <FilterChip
                  label="Medium"
                  active={problemDifficultyFilter === 'Medium'}
                  onClick={() => {
                    setProblemDifficultyFilter('Medium');
                    setProblemsPagination((p) => ({ ...p, page: 1 }));
                  }}
                  color="amber"
                />
                <FilterChip
                  label="Hard"
                  active={problemDifficultyFilter === 'Hard'}
                  onClick={() => {
                    setProblemDifficultyFilter('Hard');
                    setProblemsPagination((p) => ({ ...p, page: 1 }));
                  }}
                  color="rose"
                />
              </div>

              <span className="hidden sm:inline border-r border-slate-200/80 dark:border-white/10 h-4 mx-1" />

              {/* Media & Visualization Quick Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                <FilterChip
                  label="All Media"
                  active={problemMediaFilter === 'all'}
                  onClick={() => {
                    setProblemMediaFilter('all');
                    setProblemsPagination((p) => ({ ...p, page: 1 }));
                  }}
                />
                <FilterChip
                  label={`✨ Has Visualizer (${visualizerStatsForActiveTopic.hasVis})`}
                  active={problemMediaFilter === 'has_visualizer'}
                  onClick={() => {
                    setProblemMediaFilter((curr) => (curr === 'has_visualizer' ? 'all' : 'has_visualizer'));
                    setProblemsPagination((p) => ({ ...p, page: 1 }));
                  }}
                  color="amber"
                />
                <FilterChip
                  label={`➕ Needs Visualizer (${visualizerStatsForActiveTopic.needsVis})`}
                  active={problemMediaFilter === 'needs_visualizer'}
                  onClick={() => {
                    setProblemMediaFilter((curr) => (curr === 'needs_visualizer' ? 'all' : 'needs_visualizer'));
                    setProblemsPagination((p) => ({ ...p, page: 1 }));
                  }}
                  color="rose"
                />
                <FilterChip
                  label={`🎬 Has Video (${visualizerStatsForActiveTopic.hasVid})`}
                  active={problemMediaFilter === 'has_video'}
                  onClick={() => {
                    setProblemMediaFilter((curr) => (curr === 'has_video' ? 'all' : 'has_video'));
                    setProblemsPagination((p) => ({ ...p, page: 1 }));
                  }}
                  color="blue"
                />
              </div>

              <span className="hidden sm:inline border-r border-slate-200/80 dark:border-white/10 h-4 mx-1" />

              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                <FilterChip
                  label="Live"
                  active={problemStatusFilter === 'live' || problemStatusFilter === 'all'}
                  onClick={() => {
                    setProblemStatusFilter(problemStatusFilter === 'live' ? 'all' : 'live');
                    setProblemsPagination((p) => ({ ...p, page: 1 }));
                  }}
                  color="emerald"
                />
                <FilterChip
                  label="Deleted"
                  active={problemStatusFilter === 'deleted'}
                  onClick={() => {
                    setProblemStatusFilter('deleted');
                    setProblemsPagination((p) => ({ ...p, page: 1 }));
                  }}
                  color="rose"
                />
              </div>
            </div>
          </div>

          {/* Reordering alert */}
          {isReorderingProblems && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  You have unsaved problem order changes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveProblemOrder}
                  className="rounded-xl bg-emerald-500 px-4 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 transition"
                >
                  Save Order
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReorderingProblems(false);
                    loadAdminData(true);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Problems List */}
          {refreshing ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10 animate-pulse bg-slate-50/50 dark:bg-white/[0.02]"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2.5 flex-1">
                      <div className="h-3 w-32 rounded bg-slate-200/80 dark:bg-white/10" />
                      <div className="h-5 w-2/3 rounded bg-slate-200/80 dark:bg-white/10" />
                      <div className="h-3 w-20 rounded bg-slate-200/80 dark:bg-white/10" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-9 w-9 rounded-xl bg-slate-200/80 dark:bg-white/10" />
                      <div className="h-9 w-14 rounded-xl bg-slate-200/80 dark:bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedProblems.map((problem) => (
                <div
                  key={problem.id}
                  className="rounded-2xl border border-slate-200/80 p-4 transition hover:border-teal-500/40 hover:bg-slate-50/50 dark:border-white/10 dark:hover:bg-white/[0.01]"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                          #{problem.problemNumber}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300 uppercase tracking-wide">
                          {problem.topic}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            problem.difficulty === 'Easy'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : problem.difficulty === 'Medium'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                        {problem.approaches && problem.approaches.length > 0 && (
                          <span className="text-[11px] font-semibold text-slate-400">
                            {problem.approaches.length} approach{problem.approaches.length !== 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>

                      {/* Problem Title & External Link */}
                      <h3 className="mt-1 font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                        <span>{problem.title}</span>
                        <a
                          href={problem.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition"
                          title="Open external problem link"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </h3>

                      {/* Visualizer & Video Solution Links */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {(() => {
                          const linkedVis = getProblemVisualizer(problem);
                          const visSlug = problem.visualizerSlug || linkedVis?.slug;
                          if (visSlug) {
                            return (
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                                <Sparkles size={12} className="text-amber-500" />
                                <span>Visualizer: {visSlug}</span>
                                {linkedVis && (
                                  <span
                                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wide ${
                                      linkedVis.status === 'available'
                                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-amber-500/20 text-amber-800 dark:text-amber-200'
                                    }`}
                                  >
                                    {linkedVis.status === 'available' ? 'Live' : 'Draft'}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => onPreviewVisualizer(visSlug)}
                                  className="ml-1 text-amber-600 hover:underline inline-flex items-center gap-0.5"
                                  title="Preview visualizer animation"
                                >
                                  <Eye size={12} /> Preview
                                </button>
                              </div>
                            );
                          }
                          return (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenCreateVisualizerForProblem({
                                  id: problem.problemNumber,
                                  title: problem.title,
                                  topic: problem.topic,
                                  difficulty: problem.difficulty,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-full border border-dashed border-amber-500/40 bg-amber-500/[0.06] px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 transition"
                            >
                              <Plus size={11} />
                              <span>Add Visualization</span>
                            </button>
                          );
                        })()}

                        {problem.tutorialLink && (
                          <a
                            href={problem.tutorialLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition"
                          >
                            <PlayCircle size={12} />
                            <span>Video Solution</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Problem Actions */}
                    <div className="flex flex-wrap items-center gap-2 md:self-start">
                      <button
                        type="button"
                        onClick={() => moveProblem(problem.id, 'up')}
                        disabled={
                          problemTopicFilter === '' ||
                          problemTopicFilter === 'all' ||
                          problemSearch !== '' ||
                          problemDifficultyFilter !== 'all' ||
                          problemStatusFilter !== 'all'
                        }
                        title={
                          problemTopicFilter === '' || problemTopicFilter === 'all'
                            ? 'Filter by a specific topic to reorder'
                            : 'Move Up'
                        }
                        className="rounded-xl border border-slate-200/80 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white transition"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveProblem(problem.id, 'down')}
                        disabled={
                          problemTopicFilter === '' ||
                          problemTopicFilter === 'all' ||
                          problemSearch !== '' ||
                          problemDifficultyFilter !== 'all' ||
                          problemStatusFilter !== 'all'
                        }
                        title={
                          problemTopicFilter === '' || problemTopicFilter === 'all'
                            ? 'Filter by a specific topic to reorder'
                            : 'Move Down'
                        }
                        className="rounded-xl border border-slate-200/80 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white transition"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditProblem(problem)}
                        className="rounded-xl border border-slate-200/80 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 transition"
                      >
                        Edit
                      </button>
                      {!problem.isDeleted && (
                        <button
                          type="button"
                          onClick={() => deleteProblem(problem.id)}
                          className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/20 transition"
                        >
                          Delete
                        </button>
                      )}
                      {problem.isDeleted && (
                        <button
                          type="button"
                          onClick={() => restoreProblem(problem.id)}
                          className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/20 transition"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {displayProblems.length === 0 && (
                <div className="py-16 text-center text-sm text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                  <p className="font-semibold text-slate-600 dark:text-slate-300">
                    No problems found matching the selected filters.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try choosing another topic from the left sidebar or clearing filters.
                  </p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <RotateCcw size={12} /> Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Pagination Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200/60 pt-4 dark:border-white/5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Per page:</span>
              {([20, 50, 100, 'all'] as const).map((size) => (
                <button
                  key={String(size)}
                  type="button"
                  onClick={() => {
                    setProblemPageSize(size);
                    setProblemsPagination((p) => ({
                      ...p,
                      page: 1,
                      limit: size === 'all' ? 5000 : size,
                    }));
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    problemPageSize === size
                      ? 'bg-[#123b36] text-white dark:bg-teal-400 dark:text-[#08241f]'
                      : 'border border-slate-200/80 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5'
                  }`}
                >
                  {size === 'all' ? 'All' : size}
                </button>
              ))}
            </div>

            {problemPageSize !== 'all' && totalProblemPages > 1 && (
              <PaginationBar
                page={problemsPagination.page}
                totalPages={totalProblemPages}
                onPrev={() => setProblemsPagination((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}
                onNext={() =>
                  setProblemsPagination((p) => ({
                    ...p,
                    page: Math.min(p.page + 1, totalProblemPages),
                  }))
                }
              />
            )}
          </div>
        </div>
      </section>

      {/* ===================== ADD / EDIT PROBLEM MODAL DIALOG ===================== */}
      {isProblemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto surface rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-white/10">
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-white/10">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {editingProblemId ? 'Edit Problem' : 'Add New Problem'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure sheet problem metadata, video tutorial, and interactive visualizer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsProblemModalOpen(false);
                  resetProblemForm();
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Problem Number"
                  type="number"
                  value={problemForm.problemNumber}
                  onChange={(value) => setProblemForm((current) => ({ ...current, problemNumber: value }))}
                  placeholder="auto-generated if empty"
                />
                <Select
                  label="Difficulty"
                  value={problemForm.difficulty}
                  onChange={(value) =>
                    setProblemForm((current) => ({
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
              </div>

              <Input
                label="Problem Title"
                value={problemForm.title}
                onChange={(value) => setProblemForm((current) => ({ ...current, title: value }))}
                placeholder="e.g. Two Sum"
                required
              />

              <Input
                label="Problem Link (LeetCode, GFG, etc.)"
                value={problemForm.link}
                onChange={(value) => setProblemForm((current) => ({ ...current, link: value }))}
                placeholder="https://leetcode.com/problems/..."
                required
              />

              <Select
                label="Curriculum Topic"
                value={problemForm.topic}
                onChange={(value) => setProblemForm((current) => ({ ...current, topic: value }))}
                options={topics
                  .filter((topic) => topic.isActive !== false)
                  .map((topic) => {
                    const pillar = getPillarForTopicSlug(topic.slug);
                    return {
                      value: topic.slug,
                      label: `${topic.name}${pillar ? ` [${pillar.name}]` : ''}`,
                    };
                  })}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Video Tutorial Link (YouTube, etc.)"
                  value={problemForm.tutorialLink}
                  onChange={(value) => setProblemForm((current) => ({ ...current, tutorialLink: value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <Input
                  label="GitHub Solution Link"
                  value={problemForm.githubLink}
                  onChange={(value) => setProblemForm((current) => ({ ...current, githubLink: value }))}
                  placeholder="https://github.com/..."
                />
              </div>

              {/* Categorized Visualizer Link Section */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    Problem Interactive Visualization
                  </span>
                  {problemForm.visualizerSlug && (
                    <button
                      type="button"
                      onClick={() => onPreviewVisualizer(problemForm.visualizerSlug)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      <Eye size={12} /> Preview
                    </button>
                  )}
                </div>

                <Select
                  label="Link Existing Visualizer"
                  value={problemForm.visualizerSlug}
                  onChange={(value) => setProblemForm((current) => ({ ...current, visualizerSlug: value }))}
                  options={[
                    { value: '', label: 'None (No visualizer attached)' },
                    ...visualizers.map((v) => ({
                      value: v.slug,
                      label: `${v.name} (${v.slug}) [${v.category || v.type}]`,
                    })),
                  ]}
                />

                <Input
                  label="Or Custom Visualizer Slug"
                  value={problemForm.visualizerSlug}
                  onChange={(value) => setProblemForm((current) => ({ ...current, visualizerSlug: value }))}
                  placeholder="e.g. problem-1-two-sum"
                  helperText="Matches the visualizer slug in the Visualizer engine"
                />
              </div>

              {/* Approaches Configuration Button */}
              <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Approaches ({problemForm.approaches?.length || 0})
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Multi-solution explanations, time/space complexities, and code.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSolutionModalOpen(true)}
                    className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 transition"
                  >
                    Manage Approaches
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsProblemModalOpen(false);
                    resetProblemForm();
                  }}
                  className="rounded-xl border border-slate-200/80 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#123b36] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0b2d29] disabled:opacity-70 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 transition"
                >
                  {saving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : editingProblemId ? (
                    <Save size={15} />
                  ) : (
                    <Plus size={15} />
                  )}
                  <span>{editingProblemId ? 'Save Changes' : 'Create Problem'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
