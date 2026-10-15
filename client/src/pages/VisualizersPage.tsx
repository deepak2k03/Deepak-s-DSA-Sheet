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
  FileCode2,
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import {
  visualizerAlgorithms,
  VISUALIZER_CATEGORIES,
  type AlgorithmCategory,
  type VisualizerAlgorithm,
} from '../data/visualizers';
import { fetchPublicVisualizers } from '../utils/visualizerApi';

const difficultyBadgeStyle: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
  Medium: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
  Hard: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
};

const categoryIconMap: Record<AlgorithmCategory, React.ReactNode> = {
  Searching: <Search size={14} className="text-teal-400" />,
  Sorting: <Layers size={14} className="text-emerald-400" />,
  Graphs: <Sparkles size={14} className="text-cyan-400" />,
  'Dynamic Programming': <Code2 size={14} className="text-indigo-400" />,
};

const VisualizersPage: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<VisualizerAlgorithm[]>(visualizerAlgorithms);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  useEffect(() => {
    fetchPublicVisualizers()
      .then((data) => {
        if (data && data.length > 0) setAlgorithms(data);
      })
      .catch(() => setAlgorithms(visualizerAlgorithms))
      .finally(() => setLoading(false));
  }, []);

  // Filtered algorithms
  const filteredAlgorithms = useMemo(() => {
    return algorithms.filter((algo) => {
      const matchesSearch =
        algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || algo.category === selectedCategory;

      const matchesStatus =
        statusFilter === 'all' || algo.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [algorithms, searchQuery, selectedCategory, statusFilter]);

  const availableCount = algorithms.filter((a) => a.status === 'available').length;
  const totalCount = algorithms.length;

  return (
    <div className="page-shell">
      <AnimatedBackground />

      <main className="page-wrap py-10 sm:py-14">
        {/* Header */}
        <header className="border-b border-[var(--border-subtle)] pb-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="eyebrow mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                DSA Sheet Visualizer Engine
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                Algorithm Visualizers
              </h1>
              <p className="mt-2 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl">
                Inspect, step through, and analyze core data structure and algorithm mechanics with interactive runtime animations.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 self-start md:self-end">
              <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2.5 text-center shadow-xs">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Total
                </p>
                <p className="text-xl font-extrabold text-[var(--text-primary)]">
                  {totalCount}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-4 py-2.5 text-center shadow-xs">
                <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">
                  Ready
                </p>
                <p className="text-xl font-extrabold text-emerald-400">
                  {availableCount}
                </p>
              </div>
            </div>
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
                placeholder="Search by algorithm name, technique, or tag..."
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
                All
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
                Awaiting Code
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
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
            {VISUALIZER_CATEGORIES.map((cat) => (
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
                {categoryIconMap[cat]}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm Grid */}
        {filteredAlgorithms.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-12 text-center">
            <SlidersHorizontal size={36} className="mx-auto text-[var(--text-muted)] opacity-50" />
            <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
              No visualizers found
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Try adjusting your search query or category filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAlgorithms.map((algo) => (
              <VisualizerCard key={algo.id} algorithm={algo} />
            ))}
          </div>
        )}

        {/* Developer Integration Callout Box */}
        <section className="mt-14 rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-950/20 via-[#0a0a0a] to-[#0a0a0a] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-400 border border-teal-500/20">
                <FileCode2 size={13} />
                Developer Integration Workflow
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Ready to paste your animation code?
              </h2>
              <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                All visualizers run through dedicated standalone HTML files located in{' '}
                <code className="rounded bg-black/60 px-2 py-0.5 font-mono text-xs text-teal-300 border border-teal-500/30">
                  client/public/visualizers/*.html
                </code>
                . Open any HTML file, insert your HTML markup, CSS styling, and JavaScript logic, then set{' '}
                <code className="rounded bg-black/60 px-1.5 py-0.5 font-mono text-xs text-teal-300">
                  status: 'available'
                </code>{' '}
                in <code className="rounded bg-black/60 px-1.5 py-0.5 font-mono text-xs text-teal-300">client/src/data/visualizers.ts</code>.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <a
                href="/visualizers/README.md"
                target="_blank"
                rel="noreferrer"
                className="button-secondary text-xs font-semibold !py-2.5 !px-4"
              >
                View README Guide
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const VisualizerCard: React.FC<{ algorithm: VisualizerAlgorithm }> = ({ algorithm }) => {
  const isReady = algorithm.status === 'available';

  return (
    <Link
      to={`/visualizers/${algorithm.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 transition-all duration-200 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-950/20"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
            {categoryIconMap[algorithm.category]}
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
                Awaiting Code
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-teal-400 transition-colors flex items-center gap-2">
          {algorithm.name}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {algorithm.description}
        </p>

        {/* Complexity Summary */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-[var(--bg-surface-muted)] px-2 py-1 text-[11px] text-[var(--text-muted)] border border-[var(--border-subtle)] font-mono">
            <Clock size={11} className="text-teal-400" />
            Avg: <span className="text-[var(--text-primary)] font-medium">{algorithm.timeComplexity.average}</span>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-[var(--bg-surface-muted)] px-2 py-1 text-[11px] text-[var(--text-muted)] border border-[var(--border-subtle)] font-mono">
            <HardDrive size={11} className="text-teal-400" />
            Space: <span className="text-[var(--text-primary)] font-medium">{algorithm.spaceComplexity}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {algorithm.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--bg-surface-muted)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Action Link */}
      <div className="mt-6 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
        <span className="text-xs font-semibold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
          {isReady ? 'Launch Visualizer' : 'Preview Skeleton'}
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bg-surface-muted)] text-[var(--text-muted)] transition-all group-hover:bg-teal-500/10 group-hover:text-teal-400 group-hover:translate-x-0.5">
          <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
};

export default VisualizersPage;
