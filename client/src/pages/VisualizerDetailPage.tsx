import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
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
  Easy: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
  Medium: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
  Hard: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
};

const VisualizerDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [algorithm, setAlgorithm] = useState<VisualizerAlgorithm | null>(() => getVisualizerBySlug(slug || '') || null);
  const [loading, setLoading] = useState(!algorithm);
  const [allVisualizers, setAllVisualizers] = useState<VisualizerAlgorithm[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (slug) {
      // Immediately sync local algorithm data for snappy transition
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
            The requested algorithm visualizer does not exist or may have been moved.
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

  const pool = allVisualizers.length > 0 ? allVisualizers : getVisualizersByCategory(algorithm.category);
  const relatedAlgorithms = pool.filter(
    (item) => item.category === algorithm.category && item.slug !== algorithm.slug
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
          <span className="text-[var(--text-muted)]">{algorithm.category}</span>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-semibold">
            {algorithm.name}
          </span>
        </nav>

        {/* Top Header */}
        <header className="border-b border-[var(--border-subtle)] pb-6 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                {algorithm.category}
              </span>
              <span className="text-[var(--border-strong)]">•</span>
              <span
                className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                  difficultyBadgeStyle[algorithm.difficulty]
                }`}
              >
                {algorithm.difficulty}
              </span>
              {algorithm.status === 'available' ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 size={11} />
                  Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                  <AlertCircle size={11} />
                  Awaiting Code
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {algorithm.name}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl">
              {algorithm.description}
            </p>
          </div>
        </header>

        {/* Primary Visualizer Frame */}
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


        {/* Lower Grid: Complexity, Key Concepts */}
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
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {algorithm.timeComplexity.best}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-muted)] p-3 border border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-muted)] font-medium">Average Time</span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {algorithm.timeComplexity.average}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-muted)] p-3 border border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-muted)] font-medium">Worst Time</span>
                <span className="font-mono text-xs font-bold text-rose-400">
                  {algorithm.timeComplexity.worst}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-muted)] p-3 border border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-muted)] font-medium">Space Complexity</span>
                <span className="font-mono text-xs font-bold text-teal-400">
                  {algorithm.spaceComplexity}
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
              {algorithm.keyConcepts.map((concept, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                  <span>{concept}</span>
                </li>
              ))}
            </ul>

            {/* Tags */}
            <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
              <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                Related Topics
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
          </div>
        </div>

        {/* Related Algorithms in Same Category */}
        {relatedAlgorithms.length > 0 && (
          <section className="mt-14 border-t border-[var(--border-subtle)] pt-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  More {algorithm.category} Visualizers
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Explore other algorithms in this domain
                </p>
              </div>
              <Link
                to="/visualizers"
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"
              >
                View all <ArrowLeft size={12} className="rotate-180" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedAlgorithms.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/visualizers/${rel.slug}`}
                  className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 transition-all hover:border-teal-500/40 hover:bg-[var(--bg-surface-hover)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {rel.name}
                    </span>
                    <span
                      className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${
                        difficultyBadgeStyle[rel.difficulty]
                      }`}
                    >
                      {rel.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                    {rel.description}
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
