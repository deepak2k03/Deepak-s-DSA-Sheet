import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  PlayCircle,
  Clock,
  HardDrive,
  Code2,
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  RotateCcw,
  GitCommit,
  Binary,
  Zap,
  Boxes,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Database,
  ArrowUpRight,
  BookOpen,
  Settings2,
  Network,
  Plus,
  Trash2,
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import {
  visualizerAlgorithms,
  VISUALIZER_CATEGORIES,
  DATA_STRUCTURE_FAMILIES,
  type VisualizerAlgorithm,
  type VisualizerType,
} from '../data/visualizers';
import {
  fetchPublicVisualizers,
  fetchVisualizerCategories,
  fetchVisualizerStats,
} from '../utils/visualizerApi';

const difficultyBadgeStyle: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
  Medium: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
  Hard: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
};

const getCategoryIcon = (category: string) => {
  const lower = (category || '').toLowerCase();
  if (lower.includes('search')) return <Search size={14} className="text-teal-400" />;
  if (lower.includes('sort')) return <Layers size={14} className="text-emerald-400" />;
  if (lower.includes('graph')) return <Sparkles size={14} className="text-cyan-400" />;
  if (lower.includes('dynamic') || lower.includes('dp')) return <Code2 size={14} className="text-indigo-400" />;
  if (lower.includes('tree')) return <FolderTree size={14} className="text-emerald-400" />;
  if (lower.includes('backtrack')) return <RotateCcw size={14} className="text-amber-400" />;
  if (lower.includes('greedy')) return <Zap size={14} className="text-yellow-400" />;
  if (lower.includes('list')) return <GitCommit size={14} className="text-purple-400" />;
  if (lower.includes('heap') || lower.includes('trie')) return <Binary size={14} className="text-rose-400" />;
  return <FolderTree size={14} className="text-teal-400" />;
};

const VisualizersPage: React.FC = () => {
  const [activePillar, setActivePillar] = useState<VisualizerType>('algorithm');
  const [allVisualizers, setAllVisualizers] = useState<VisualizerAlgorithm[]>(visualizerAlgorithms);
  const [apiCategories, setApiCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFamily, setSelectedFamily] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [stats, setStats] = useState({
    total: 0,
    algorithms: 0,
    dataStructures: 0,
    problems: 0,
    live: 0,
    awaiting: 0,
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchPublicVisualizers().catch(() => visualizerAlgorithms),
      fetchVisualizerCategories().catch(() => []),
      fetchVisualizerStats().catch(() => ({ total: 0, algorithms: 0, dataStructures: 0, problems: 0, live: 0, awaiting: 0 })),
    ])
      .then(([visData, cats, statsData]) => {
        if (visData && visData.length > 0) {
          setAllVisualizers(visData);
        }
        if (cats && cats.length > 0) {
          setApiCategories(cats.map((c) => c.name));
        }
        if (statsData) {
          setStats(statsData);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute pillar counts
  const algorithmItems = useMemo(
    () => allVisualizers.filter((v) => !v.type || v.type === 'algorithm'),
    [allVisualizers]
  );
  const dataStructureItems = useMemo(
    () => allVisualizers.filter((v) => v.type === 'data-structure'),
    [allVisualizers]
  );
  const problemItems = useMemo(
    () => allVisualizers.filter((v) => v.type === 'problem'),
    [allVisualizers]
  );

  // Categories list for Algorithm pillar
  const allCategories = useMemo(() => {
    const set = new Set<string>(VISUALIZER_CATEGORIES);
    for (const c of apiCategories) if (c) set.add(c);
    for (const a of algorithmItems) if (a.category) set.add(a.category);
    return Array.from(set);
  }, [apiCategories, algorithmItems]);

  // Topics list for Problem solutions pillar
  const allProblemTopics = useMemo(() => {
    const set = new Set<string>();
    for (const p of problemItems) {
      if (p.problemTopic) set.add(p.problemTopic);
      else if (p.category) set.add(p.category);
    }
    return Array.from(set);
  }, [problemItems]);

  // Filtered list based on active pillar and sub-filters
  const currentPillarItems = useMemo(() => {
    let pool: VisualizerAlgorithm[] = [];
    if (activePillar === 'algorithm') pool = algorithmItems;
    else if (activePillar === 'data-structure') pool = dataStructureItems;
    else if (activePillar === 'problem') pool = problemItems;

    return pool.filter((item) => {
      // 1. Search filter
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesProb = item.problemTitle?.toLowerCase().includes(q) || String(item.problemId || '').includes(q);
        const matchesOps = item.operations?.some((op) => op.name.toLowerCase().includes(q) || op.description?.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTags && !matchesProb && !matchesOps) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // 3. Pillar specific filters
      if (activePillar === 'algorithm') {
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }
      } else if (activePillar === 'data-structure') {
        if (selectedFamily !== 'All' && item.dataStructureType !== selectedFamily) {
          return false;
        }
      } else if (activePillar === 'problem') {
        if (selectedTopic !== 'All' && item.problemTopic?.toLowerCase() !== selectedTopic.toLowerCase() && item.category !== selectedTopic) {
          return false;
        }
        if (selectedDifficulty !== 'All' && (item.problemDifficulty || item.difficulty) !== selectedDifficulty) {
          return false;
        }
      }

      return true;
    });
  }, [
    activePillar,
    algorithmItems,
    dataStructureItems,
    problemItems,
    searchQuery,
    statusFilter,
    selectedCategory,
    selectedFamily,
    selectedTopic,
    selectedDifficulty,
  ]);

  const activeLiveCount = currentPillarItems.filter((i) => i.status === 'available').length;

  return (
    <div className="page-shell">
      <AnimatedBackground />

      <main className="page-wrap py-10 sm:py-14">
        {/* Header */}
        <header className="border-b border-[var(--border-subtle)] pb-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="eyebrow mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                DSA Sheet Visualizer Engine
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                Computer Science & Problem Visualizers
              </h1>
              <p className="mt-2 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Step through runtime algorithm mechanics, examine data structures and their operations, or inspect step-by-step visual solutions for problems in your sheet.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0 self-start lg:self-end">
              <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2.5 text-center shadow-xs">
                <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {activePillar === 'algorithm' ? 'Algorithms' : activePillar === 'data-structure' ? 'Data Structures' : 'Problems'}
                </p>
                <p className="text-xl font-extrabold text-[var(--text-primary)]">
                  {currentPillarItems.length}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-4 py-2.5 text-center shadow-xs">
                <p className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider">
                  Live Animations
                </p>
                <p className="text-xl font-extrabold text-emerald-400">
                  {activeLiveCount}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Pillars Segmented Navigation */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pillar 1: Algorithms */}
            <button
              type="button"
              onClick={() => {
                setActivePillar('algorithm');
                setSearchQuery('');
              }}
              className={`relative flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                activePillar === 'algorithm'
                  ? 'border-teal-500/60 bg-gradient-to-br from-teal-950/40 via-[var(--bg-surface)] to-[var(--bg-surface)] shadow-lg shadow-teal-950/20 ring-1 ring-teal-500/40'
                  : 'border-[var(--border-strong)] bg-[var(--bg-surface)] hover:border-teal-500/30 hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                  activePillar === 'algorithm'
                    ? 'border-teal-500/40 bg-teal-500/20 text-teal-300'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-muted)]'
                }`}
              >
                <Zap size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-[var(--text-primary)] truncate">
                    1. Algorithms
                  </h2>
                  <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-bold text-teal-400 border border-teal-500/20">
                    {algorithmItems.length}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-1">
                  Sorting, Searching, Graphs, DP & Trees
                </p>
              </div>
            </button>

            {/* Pillar 2: Data Structures */}
            <button
              type="button"
              onClick={() => {
                setActivePillar('data-structure');
                setSearchQuery('');
              }}
              className={`relative flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                activePillar === 'data-structure'
                  ? 'border-indigo-500/60 bg-gradient-to-br from-indigo-950/40 via-[var(--bg-surface)] to-[var(--bg-surface)] shadow-lg shadow-indigo-950/20 ring-1 ring-indigo-500/40'
                  : 'border-[var(--border-strong)] bg-[var(--bg-surface)] hover:border-indigo-500/30 hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                  activePillar === 'data-structure'
                    ? 'border-indigo-500/40 bg-indigo-500/20 text-indigo-300'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-muted)]'
                }`}
              >
                <Boxes size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-[var(--text-primary)] truncate">
                    2. Data Structures
                  </h2>
                  <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-bold text-indigo-400 border border-indigo-500/20">
                    {dataStructureItems.length}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-1">
                  Structures & Operations (Insert, Delete, Search)
                </p>
              </div>
            </button>

            {/* Pillar 3: Sheet Problem Solutions */}
            <button
              type="button"
              onClick={() => {
                setActivePillar('problem');
                setSearchQuery('');
              }}
              className={`relative flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                activePillar === 'problem'
                  ? 'border-amber-500/60 bg-gradient-to-br from-amber-950/40 via-[var(--bg-surface)] to-[var(--bg-surface)] shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/40'
                  : 'border-[var(--border-strong)] bg-[var(--bg-surface)] hover:border-amber-500/30 hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                  activePillar === 'problem'
                    ? 'border-amber-500/40 bg-amber-500/20 text-amber-300'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-muted)]'
                }`}
              >
                <Lightbulb size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-[var(--text-primary)] truncate">
                    3. Sheet Problems
                  </h2>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20">
                    {problemItems.length}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-1">
                  Step-by-step visual solutions for sheet problems
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* Search & Filter Toolbar */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search Input */}
            <label className="relative flex-1 block">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activePillar === 'algorithm'
                    ? 'Search algorithms by name, technique, or tag...'
                    : activePillar === 'data-structure'
                    ? 'Search data structures by name, operation, or family...'
                    : 'Search sheet problems by title, problem #ID, or topic...'
                }
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--text-primary)] focus:ring-1 focus:ring-[var(--text-primary)]"
              />
            </label>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-1">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-[var(--accent-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('available')}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === 'available'
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-emerald-400'
                }`}
              >
                <CheckCircle2 size={12} />
                Live
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('unavailable')}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === 'unavailable'
                    ? 'bg-amber-500/20 text-amber-300 shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-amber-400'
                }`}
              >
                <AlertCircle size={12} />
                Awaiting Upload
              </button>
            </div>
          </div>

          {/* Sub-Filters Specific to Active Pillar */}
          {activePillar === 'algorithm' && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                  selectedCategory === 'All'
                    ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--text-inverted)]'
                    : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                All Categories
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                    selectedCategory === cat
                      ? 'border-teal-500/50 bg-teal-950/40 text-teal-300'
                      : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  {cat}
                </button>
              ))}
            </div>
          )}

          {activePillar === 'data-structure' && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {DATA_STRUCTURE_FAMILIES.map((family) => (
                <button
                  key={family}
                  type="button"
                  onClick={() => setSelectedFamily(family)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                    selectedFamily === family
                      ? 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300'
                      : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  <Boxes size={13} className={selectedFamily === family ? 'text-indigo-300' : 'text-[var(--text-muted)]'} />
                  {family === 'All' ? 'All Structure Types' : family}
                </button>
              ))}
            </div>
          )}

          {activePillar === 'problem' && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedTopic('All')}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                  selectedTopic === 'All'
                    ? 'border-amber-500/50 bg-amber-950/40 text-amber-300'
                    : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                All Topics
              </button>
              {allProblemTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                    selectedTopic === topic
                      ? 'border-amber-500/50 bg-amber-950/40 text-amber-300'
                      : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  <Lightbulb size={12} className={selectedTopic === topic ? 'text-amber-300' : 'text-[var(--text-muted)]'} />
                  {topic}
                </button>
              ))}

              <span className="mx-1 self-center border-l border-[var(--border-strong)] h-4" />

              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                    selectedDifficulty === diff
                      ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--text-inverted)]'
                      : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {diff === 'All' ? 'Any Difficulty' : diff}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Visualizers Grid */}
        {currentPillarItems.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-12 text-center">
            <SlidersHorizontal size={36} className="mx-auto text-[var(--text-muted)] opacity-50" />
            <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
              No visualizers found in this section
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Try adjusting your search query, difficulty, or category filters.
            </p>
            {(searchQuery || selectedCategory !== 'All' || selectedFamily !== 'All' || selectedTopic !== 'All' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedFamily('All');
                  setSelectedTopic('All');
                  setSelectedDifficulty('All');
                  setStatusFilter('all');
                }}
                className="button-secondary text-xs font-semibold mt-4 !py-2 !px-4"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {currentPillarItems.map((item) => {
              if (activePillar === 'data-structure') {
                return <DataStructureCard key={item.id} visualizer={item} />;
              }
              if (activePillar === 'problem') {
                return <ProblemVisualizerCard key={item.id} visualizer={item} />;
              }
              return <AlgorithmCard key={item.id} algorithm={item} />;
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

/* Pillar 1: Algorithm Card Component */
const AlgorithmCard: React.FC<{ algorithm: VisualizerAlgorithm }> = ({ algorithm }) => {
  const isReady = algorithm.status === 'available';

  return (
    <Link
      to={`/visualizers/${algorithm.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 transition-all duration-200 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-950/20"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
            {getCategoryIcon(algorithm.category)}
            {algorithm.category}
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                difficultyBadgeStyle[algorithm.difficulty]
              }`}
            >
              {algorithm.difficulty}
            </span>
            {isReady ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <CheckCircle2 size={10} />
                Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                <AlertCircle size={10} />
                Awaiting Upload
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-teal-400 transition-colors flex items-center gap-2">
          {algorithm.name}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {algorithm.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-[var(--bg-surface-muted)] px-2 py-1 text-[11px] text-[var(--text-muted)] border border-[var(--border-subtle)] font-mono">
            <Clock size={11} className="text-teal-400" />
            Avg: <span className="text-[var(--text-primary)] font-medium">{algorithm.timeComplexity?.average || 'O(n)'}</span>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-[var(--bg-surface-muted)] px-2 py-1 text-[11px] text-[var(--text-muted)] border border-[var(--border-subtle)] font-mono">
            <HardDrive size={11} className="text-teal-400" />
            Space: <span className="text-[var(--text-primary)] font-medium">{algorithm.spaceComplexity || 'O(1)'}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-xs font-semibold text-teal-400">
        <span className="flex items-center gap-1.5">
          <PlayCircle size={15} />
          {isReady ? 'Launch Algorithm Visualizer' : 'View Visualizer Details'}
        </span>
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
};

/* Pillar 2: Data Structure Card Component (Simple & Clean, Matching Algorithm Card) */
const DataStructureCard: React.FC<{ visualizer: VisualizerAlgorithm }> = ({ visualizer }) => {
  const isReady = visualizer.status === 'available';

  return (
    <Link
      to={`/visualizers/${visualizer.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 transition-all duration-200 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-950/20"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
            <Boxes size={14} className="text-teal-400" />
            {visualizer.dataStructureType || visualizer.category || 'Data Structure'}
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                difficultyBadgeStyle[visualizer.difficulty] || difficultyBadgeStyle['Medium']
              }`}
            >
              {visualizer.difficulty || 'Medium'}
            </span>
            {isReady ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <CheckCircle2 size={10} />
                Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                <AlertCircle size={10} />
                Awaiting Upload
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-teal-400 transition-colors flex items-center gap-2">
          {visualizer.name}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {visualizer.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-xs font-semibold text-teal-400">
        <span className="flex items-center gap-1.5">
          <PlayCircle size={15} />
          {isReady ? 'Launch Data Structure Visualizer' : 'View Visualizer Details'}
        </span>
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
};

/* Pillar 3: Sheet Problem Solution Card Component */
const ProblemVisualizerCard: React.FC<{ visualizer: VisualizerAlgorithm }> = ({ visualizer }) => {
  const isReady = visualizer.status === 'available';

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 transition-all duration-200 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-950/20">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            {visualizer.problemId && (
              <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-400 font-mono">
                #{visualizer.problemId}
              </span>
            )}
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {visualizer.problemTopic || visualizer.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                difficultyBadgeStyle[visualizer.problemDifficulty || visualizer.difficulty || 'Medium']
              }`}
            >
              {visualizer.problemDifficulty || visualizer.difficulty}
            </span>
            {isReady ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <CheckCircle2 size={10} />
                Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                <AlertCircle size={10} />
                Awaiting Upload
              </span>
            )}
          </div>
        </div>

        <Link to={`/visualizers/${visualizer.slug}`}>
          <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-amber-400 transition-colors">
            {visualizer.name}
          </h3>
        </Link>

        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {visualizer.description}
        </p>

        {/* Quick Sheet Links */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {visualizer.problemLink && (
            <a
              href={visualizer.problemLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)] hover:text-amber-400 hover:border-amber-500/30 transition-colors"
            >
              <ExternalLink size={11} />
              Original Problem
            </a>
          )}
          {visualizer.problemId && (
            <Link
              to={`/problem/${visualizer.problemId}/solution`}
              className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)] hover:text-teal-400 hover:border-teal-500/30 transition-colors"
            >
              <Code2 size={11} />
              Code Solution
            </Link>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-xs font-semibold text-amber-400">
        <Link
          to={`/visualizers/${visualizer.slug}`}
          className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
        >
          <PlayCircle size={15} />
          {isReady ? 'Launch Problem Visual Solution' : 'View Problem Animation Info'}
        </Link>
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};

export default VisualizersPage;
