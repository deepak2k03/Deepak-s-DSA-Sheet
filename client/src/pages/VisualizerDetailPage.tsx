import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Boxes,
  Database,
  Lightbulb,
  ExternalLink,
  Code2,
  HardDrive,
  Layers,
  Zap,
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import VisualizerFrame from '../components/VisualizerFrame';
import {
  getVisualizerBySlug,
  getVisualizersByCategory,
  type VisualizerAlgorithm,
} from '../data/visualizers';
import { fetchVisualizerBySlug, fetchPublicVisualizers } from '../utils/visualizerApi';
import { apiUrl } from '../config';
import { getStoredToken } from '../utils/auth';

const difficultyBadgeStyle: Record<string, string> = {
  Easy: 'text-emerald-700 bg-emerald-50 border-emerald-200/60 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-500/30',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200/60 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-500/30',
  Hard: 'text-rose-700 bg-rose-50 border-rose-200/60 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-500/30',
};

const VisualizerDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [algorithm, setAlgorithm] = useState<VisualizerAlgorithm | null>(() => getVisualizerBySlug(slug || '') || null);
  const [loading, setLoading] = useState(!algorithm);
  const [allVisualizers, setAllVisualizers] = useState<VisualizerAlgorithm[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (slug) {
      const local = getVisualizerBySlug(slug) || null;
      setAlgorithm(local);
      if (!local) setLoading(true);

      fetchVisualizerBySlug(slug)
        .then((algo) => {
          if (isMounted && algo) {
            setAlgorithm(algo);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      fetchPublicVisualizers().then((list) => {
        if (isMounted) setAllVisualizers(list);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="page-shell flex flex-col items-center justify-center min-h-[60vh]">
        <AnimatedBackground />
        <Loader2 size={36} className="animate-spin text-teal-400 mb-3" />
        <p className="text-sm text-[var(--text-muted)]">Loading visualizer...</p>
      </div>
    );
  }

  if (!algorithm) {
    return (
      <div className="page-shell">
        <AnimatedBackground />
        <div className="page-wrap py-20 text-center">
          <AlertCircle size={48} className="mx-auto text-amber-400 mb-4" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Visualizer Not Found
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            The requested visualizer does not exist or may have been moved.
          </p>
          <div className="mt-6">
            <Link to="/visualizers" className="button-primary text-sm font-semibold">
              <ArrowLeft size={16} />
              Back to Visualizers
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isDataStructure = algorithm.type === 'data-structure';
  const isProblem = algorithm.type === 'problem';
  const operations = algorithm.operations || [];

  const pool = allVisualizers.length > 0 ? allVisualizers : getVisualizersByCategory(algorithm.category);
  const relatedVisualizers = pool.filter(
    (item) => item.slug !== algorithm.slug && (item.type === algorithm.type || (!item.type && !algorithm.type))
  );

  return (
    <div className="page-shell">
      <AnimatedBackground />

      <main className="page-wrap py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] mb-6">
          <Link
            to="/visualizers"
            className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft size={14} />
            Visualizers
          </Link>
          <span>/</span>
          <span className="text-[var(--text-muted)]">
            {isDataStructure ? 'Data Structures' : isProblem ? 'Sheet Problems' : algorithm.category}
          </span>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-semibold truncate max-w-xs">
            {algorithm.name}
          </span>
        </nav>

        {/* Top Header */}
        <header className="border-b border-[var(--border-subtle)] pb-6 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              {/* Type Pill */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  isDataStructure
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30'
                    : isProblem
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                    : 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/15 dark:text-teal-400 dark:border-teal-500/30'
                }`}
              >
                {isDataStructure ? <Boxes size={12} /> : isProblem ? <Lightbulb size={12} /> : <Zap size={12} />}
                {isDataStructure ? 'Data Structure' : isProblem ? 'Problem Solution' : 'Algorithm'}
              </span>

              {algorithm.category && (
                <>
                  <span className="text-[var(--border-strong)]">•</span>
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    {algorithm.category}
                  </span>
                </>
              )}

              <span className="text-[var(--border-strong)]">•</span>
              <span
                className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                  difficultyBadgeStyle[algorithm.problemDifficulty || algorithm.difficulty || 'Medium']
                }`}
              >
                {algorithm.problemDifficulty || algorithm.difficulty}
              </span>

              {algorithm.status === 'available' ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 size={11} />
                  Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400">
                  <AlertCircle size={11} />
                  Awaiting Upload
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {algorithm.name}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
              {algorithm.description}
            </p>

            {/* Quick action links for sheet problems */}
            {isProblem && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {algorithm.problemLink && (
                  <a
                    href={algorithm.problemLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-secondary text-xs font-semibold !py-2 !px-3.5 inline-flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    Open Original Problem
                  </a>
                )}
                {algorithm.problemId && (
                  <Link
                    to={`/problem/${algorithm.problemId}/solution`}
                    className="button-primary text-xs font-semibold !py-2 !px-3.5 inline-flex items-center gap-1.5"
                  >
                    <Code2 size={13} />
                    View Code Solution & Approaches
                  </Link>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Primary Visualizer Frame (R2 Isolated Iframe) */}
        <section className="mb-10">
          {(() => {
            const token = getStoredToken();
            const rawRenderUrl = algorithm.renderUrl
              ? apiUrl(algorithm.renderUrl)
              : apiUrl(`/api/visualizers/render/${algorithm.slug}`);
            const cacheKey = algorithm.updatedAt
              ? new Date(algorithm.updatedAt).getTime()
              : (algorithm.fileChecksum || '1');
            const separator = rawRenderUrl.includes('?') ? '&' : '?';
            const withCacheBuster = `${rawRenderUrl}${separator}v=${cacheKey}`;
            const renderSrc = token ? `${withCacheBuster}&token=${encodeURIComponent(token)}` : withCacheBuster;

            return (
              <VisualizerFrame
                key={`${algorithm.slug}-${cacheKey}`}
                src={renderSrc}
                title={`${algorithm.name} Visualizer`}
                status={algorithm.status}
                aspectRatio="video"
              />
            );
          })()}
        </section>

        {/* Dynamic Detail Content According to Pillar */}
        {isDataStructure ? (
          /* Pillar 2: Data Structure Operations Matrix */
          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <Database size={18} className="text-indigo-400" />
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Supported Operations Matrix
                  </h2>
                </div>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/20">
                  {operations.length} Core Actions
                </span>
              </div>

              {operations.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] italic">
                  No specific operations listed for this structure.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {operations.map((op, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-bold text-sm text-[var(--text-primary)]">
                            {op.name}
                          </span>
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 dark:text-indigo-400 dark:bg-indigo-500/15 dark:border-indigo-500/30 px-2 py-0.5 rounded">
                            {op.timeComplexity}
                          </span>
                        </div>
                        {op.description && (
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {op.description}
                          </p>
                        )}
                      </div>
                      {op.spaceComplexity && (
                        <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                          <span>Space:</span>
                          <span className="font-mono font-medium text-[var(--text-secondary)]">
                            {op.spaceComplexity}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags & Characteristics */}
            {algorithm.tags && algorithm.tags.length > 0 && (
              <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Data Structure Classification & Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {algorithm.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--bg-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : isProblem ? (
          /* Pillar 3: Problem Solution Detail */
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Problem Overview Card */}
            <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={18} className="text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Sheet Problem Details
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-muted)] p-3 border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Sheet Problem ID</span>
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                    #{algorithm.problemId || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-muted)] p-3 border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Sheet Topic</span>
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {algorithm.problemTopic || algorithm.category}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-muted)] p-3 border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Problem Difficulty</span>
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                    {algorithm.problemDifficulty || algorithm.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-muted)] p-3 border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Expected Time</span>
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {algorithm.timeComplexity?.average || 'O(n)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Solution Notes */}
            <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={18} className="text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Visual Solution Notes
                </h2>
              </div>

              <ul className="space-y-3">
                {(algorithm.keyConcepts && algorithm.keyConcepts.length > 0
                  ? algorithm.keyConcepts
                  : [
                      'Interactive runtime state updates directly reflect the problem logic.',
                      'Follow variable pointers, array transformations, or graph traversal steps.',
                      'Use playback controls in the visualizer above to play, pause, or step through.',
                    ]
                ).map((concept, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">Looking for written code?</span>
                {algorithm.problemId && (
                  <Link
                    to={`/problem/${algorithm.problemId}/solution`}
                    className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                  >
                    Open Code Solution <Code2 size={13} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Pillar 1: Standard Algorithm Details (Complexity + Key Concepts) */
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Complexity Breakdown */}
            <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-teal-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Complexity Breakdown
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-muted)] p-3 border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Best Time</span>
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {algorithm.timeComplexity?.best || 'O(1)'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-muted)] p-3 border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Average Time</span>
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                    {algorithm.timeComplexity?.average || 'O(n)'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-muted)] p-3 border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Worst Time</span>
                  <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-400">
                    {algorithm.timeComplexity?.worst || 'O(n)'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-muted)] p-3 border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Space Complexity</span>
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                    {algorithm.spaceComplexity || 'O(1)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Algorithmic Concepts */}
            <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-teal-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Key Concepts
                </h2>
              </div>

              <ul className="space-y-3">
                {algorithm.keyConcepts && algorithm.keyConcepts.length > 0 ? (
                  algorithm.keyConcepts.map((concept, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                      <span>{concept}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-[var(--text-muted)]">
                    No concept notes specified yet.
                  </li>
                )}
              </ul>

              {/* Tags */}
              {algorithm.tags && algorithm.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                    Related Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {algorithm.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[var(--bg-surface-muted)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Related Visualizers in Same Pillar */}
        {relatedVisualizers.length > 0 && (
          <section className="mt-14 border-t border-[var(--border-subtle)] pt-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {isDataStructure
                    ? 'Explore More Data Structures'
                    : isProblem
                    ? 'More Sheet Problem Visual Solutions'
                    : `More ${algorithm.category} Visualizers`}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Continue learning with related visualizations.
                </p>
              </div>

              <Link
                to="/visualizers"
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
              >
                View All Visualizers <ArrowLeft size={13} className="rotate-180" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedVisualizers.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  to={`/visualizers/${item.slug}`}
                  className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 transition-all hover:border-teal-500/40 hover:bg-[var(--bg-surface-hover)] group"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                      {item.dataStructureType || item.problemTopic || item.category}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        difficultyBadgeStyle[item.problemDifficulty || item.difficulty || 'Medium']
                      }`}
                    >
                      {item.problemDifficulty || item.difficulty}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-teal-400 transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-2">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default VisualizerDetailPage;
