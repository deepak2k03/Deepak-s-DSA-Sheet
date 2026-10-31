import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  PlayCircle,
  Clock,
  Database,
  ChevronRight,
  Loader2,
  AlertCircle,
  Github,
  ExternalLink,
  Code2,
  Sparkles,
  Tv,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import VisualizerFrame from '../components/VisualizerFrame';
import CodeBlock from '../components/CodeBlock';
import { apiUrl } from '../config';

type Language = 'C++' | 'Java' | 'Python' | 'JavaScript' | string;

interface CodeSnippet {
  language: Language;
  code: string;
}

interface Approach {
  id: string;
  title: string;
  algorithm: string;
  timeComplexity: string;
  spaceComplexity: string;
  codeSnippets: CodeSnippet[];
}

interface ProblemDetail {
  id: number;
  title: string;
  link?: string;
  topic?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tutorialLink?: string;
  videoSolutionUrl?: string;
  githubLink?: string;
  visualizerSlug?: string;
  hasVisualizer?: boolean;
  approaches?: Approach[];
}

const difficultyBadgeStyle: Record<string, string> = {
  Easy: 'text-emerald-700 bg-emerald-50 border-emerald-200/60 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-500/30',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200/60 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-500/30',
  Hard: 'text-rose-700 bg-rose-50 border-rose-200/60 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-500/30',
};

const getEmbedUrl = (url?: string) => {
  if (!url) return '';
  try {
    if (url.includes('youtube.com/embed/')) return url;

    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {
    return url;
  }
  return url;
};

type ActiveMediaView = 'none' | 'visualizer' | 'video';

const SolutionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeTabs, setActiveTabs] = useState<Record<string, Language>>({});
  const [activeMedia, setActiveMedia] = useState<ActiveMediaView>('none');

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl(`/api/problems/single/${id}`));
        if (!res.ok) throw new Error('Problem not found');
        const data = await res.json();
        setProblem(data);

        if (data.approaches && data.approaches.length > 0) {
          setExpandedSection(data.approaches[0].id || '0');
          const defaultTabs: Record<string, Language> = {};
          data.approaches.forEach((app: Approach, idx: number) => {
            const key = app.id || String(idx);
            if (app.codeSnippets && app.codeSnippets.length > 0) {
              defaultTabs[key] = app.codeSnippets[0].language;
            }
          });
          setActiveTabs(defaultTabs);
        }

        // If visualization exists, make it available or open by default if requested
        if (data.visualizerSlug) {
          // Keep as option for user to toggle
        }
      } catch (err) {
        setError('Failed to load problem details. It may not exist.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProblem();
  }, [id]);

  const toggleSection = (sectionId: string) => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
  };

  const setTab = (sectionId: string, lang: Language) => {
    setActiveTabs((prev) => ({ ...prev, [sectionId]: lang }));
  };

  const videoUrl = problem?.videoSolutionUrl || problem?.tutorialLink || '';
  const embedVideoUrl = useMemo(() => getEmbedUrl(videoUrl), [videoUrl]);
  const hasVisualizer = Boolean(problem?.visualizerSlug || problem?.hasVisualizer);
  const hasVideo = Boolean(videoUrl);

  if (loading) {
    return (
      <div className="page-shell flex flex-col items-center justify-center min-h-[60vh]">
        <AnimatedBackground />
        <Loader2 className="animate-spin h-8 w-8 text-teal-500 mb-3" />
        <p className="text-sm text-[var(--text-muted)]">Loading solution...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="page-shell">
        <AnimatedBackground />
        <div className="page-wrap py-20 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-rose-500" />
          <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Problem Not Found</h1>
          <p className="text-[var(--text-secondary)] mb-6">{error || 'This problem does not exist in the database.'}</p>
          <div>
            <Link to="/topics" className="button-primary text-xs font-semibold inline-flex items-center gap-2">
              <ArrowLeft size={16} /> Return to Roadmap
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const approaches = problem.approaches || [];
  const hasApproaches = approaches.length > 0;

  return (
    <div className="page-shell">
      <AnimatedBackground />

      <main className="page-wrap py-8 sm:py-12">
        {/* Navigation & Header */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Link
              to={problem.topic ? `/topic/${problem.topic}` : '/topics'}
              className="inline-flex items-center text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1.5" />
              Back to {problem.topic ? `${problem.topic.charAt(0).toUpperCase() + problem.topic.slice(1)} Problems` : 'Roadmap'}
            </Link>

            {problem.link && (
              <a
                href={problem.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <span>Solve on Platform</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300">
                  #{problem.id}
                </span>
                {problem.topic && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 uppercase tracking-wider border border-teal-500/20">
                    {problem.topic}
                  </span>
                )}
                {problem.difficulty && (
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      difficultyBadgeStyle[problem.difficulty] || difficultyBadgeStyle.Medium
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {problem.title}
              </h1>
            </div>

            {/* Quick Action Buttons for Media */}
            <div className="flex flex-wrap items-center gap-2.5">
              {hasVisualizer && (
                <button
                  type="button"
                  onClick={() => setActiveMedia((curr) => (curr === 'visualizer' ? 'none' : 'visualizer'))}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm ${
                    activeMedia === 'visualizer'
                      ? 'bg-amber-500 text-white shadow-amber-500/20 shadow-md ring-2 ring-amber-400'
                      : 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-500/30 dark:text-amber-300'
                  }`}
                >
                  <Sparkles size={16} className={activeMedia === 'visualizer' ? '' : 'text-amber-500 animate-pulse'} />
                  <span>{activeMedia === 'visualizer' ? 'Hide Visualization' : 'Watch Visualization'}</span>
                </button>
              )}

              {hasVideo && (
                <button
                  type="button"
                  onClick={() => setActiveMedia((curr) => (curr === 'video' ? 'none' : 'video'))}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm ${
                    activeMedia === 'video'
                      ? 'bg-rose-500 text-white shadow-rose-500/20 shadow-md ring-2 ring-rose-400'
                      : 'bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 border border-rose-500/30 dark:text-rose-300'
                  }`}
                >
                  <PlayCircle size={16} className={activeMedia === 'video' ? '' : 'text-rose-500'} />
                  <span>{activeMedia === 'video' ? 'Hide Video Tutorial' : 'Watch Video Tutorial'}</span>
                </button>
              )}

              {problem.githubLink && (
                <a
                  href={problem.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-surface-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-sm hover:bg-[var(--bg-surface)] hover:text-teal-500 transition-colors"
                  title="View solution on GitHub"
                >
                  <Github size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Media Section (Interactive Visualizer OR Video Solution) */}
        {activeMedia === 'visualizer' && hasVisualizer && (
          <section className="mb-10 rounded-3xl border border-amber-500/30 bg-amber-500/[0.03] p-5 sm:p-6 shadow-xl animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Interactive Problem Visualization
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Step through the algorithm visually to understand state changes and pointers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/visualizers/${problem.visualizerSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition"
                >
                  <span>Open Fullscreen</span>
                  <ExternalLink size={12} />
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveMedia('none')}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a0a0a] shadow-inner">
              <VisualizerFrame
                src={`/api/visualizers/render/${problem.visualizerSlug}`}
                title={problem.title}
                aspectRatio="video"
                status="available"
                showOpenNewTab={true}
              />
            </div>
          </section>
        )}

        {activeMedia === 'video' && hasVideo && (
          <section className="mb-10 rounded-3xl border border-rose-500/30 bg-rose-500/[0.03] p-5 sm:p-6 shadow-xl animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30">
                  <Tv size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Video Solution &amp; Tutorial
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Detailed video walkthrough covering intuition, edge cases, and code implementation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition"
                >
                  <span>Watch on YouTube</span>
                  <ExternalLink size={12} />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveMedia('none')}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-lg pb-[56.25%]">
              <iframe
                className="absolute left-0 top-0 h-full w-full border-0"
                src={embedVideoUrl}
                title="Video Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Solution Approaches */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-teal-600 dark:text-teal-400" />
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Solution Approaches {hasApproaches && `(${approaches.length})`}
              </h2>
            </div>
            {hasApproaches && (
              <span className="text-xs font-medium text-[var(--text-muted)]">
                Click approach to expand / collapse
              </span>
            )}
          </div>

          {!hasApproaches && (
            <div className="p-12 text-center rounded-3xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)]">
              <Code2 size={36} className="mx-auto text-[var(--text-muted)] mb-3" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">No written approaches yet</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
                Detailed written algorithmic approaches and code snippets for this problem are coming soon.
              </p>
              {(hasVisualizer || hasVideo) && (
                <div className="mt-4 flex justify-center gap-3">
                  {hasVisualizer && (
                    <button
                      type="button"
                      onClick={() => setActiveMedia('visualizer')}
                      className="button-primary text-xs font-semibold"
                    >
                      <Sparkles size={14} /> Open Visualization
                    </button>
                  )}
                  {hasVideo && (
                    <button
                      type="button"
                      onClick={() => setActiveMedia('video')}
                      className="button-secondary text-xs font-semibold"
                    >
                      <PlayCircle size={14} /> Play Video Tutorial
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {approaches.map((approach, index) => {
            const sectionKey = approach.id || String(index);
            const isExpanded = expandedSection === sectionKey;
            const currentTabLang = activeTabs[sectionKey] || (approach.codeSnippets?.[0]?.language || 'C++');
            const currentSnippet = approach.codeSnippets?.find((s) => s.language === currentTabLang) || approach.codeSnippets?.[0];

            return (
              <div
                key={sectionKey}
                className="overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] transition-all hover:border-teal-500/40"
              >
                {/* Approach Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(sectionKey)}
                  className="flex w-full items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-[var(--bg-surface-hover)] focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold text-xs border border-teal-500/20">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                        {approach.title || `Approach ${index + 1}`}
                      </h3>
                      {(approach.timeComplexity || approach.spaceComplexity) && (
                        <div className="flex items-center gap-2 mt-1">
                          {approach.timeComplexity && (
                            <span className="font-mono text-[11px] text-[var(--text-muted)]">
                              Time: <strong className="text-teal-600 dark:text-teal-400">{approach.timeComplexity}</strong>
                            </span>
                          )}
                          {approach.spaceComplexity && (
                            <>
                              <span className="text-[var(--text-muted)]">•</span>
                              <span className="font-mono text-[11px] text-[var(--text-muted)]">
                                Space: <strong className="text-indigo-600 dark:text-indigo-400">{approach.spaceComplexity}</strong>
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-1 rounded-lg text-[var(--text-muted)]">
                    {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                  </div>
                </button>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="border-t border-[var(--border-subtle)] p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
                    {/* Algorithm Intuition / Step-by-Step */}
                    {approach.algorithm && (
                      <div>
                        <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                          <ChevronRight size={16} className="text-teal-500" />
                          Intuition &amp; Algorithm
                        </h4>
                        <div className="rounded-2xl bg-[var(--bg-base)] p-4 sm:p-5 text-[var(--text-primary)] border border-[var(--border-subtle)] text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                          {approach.algorithm}
                        </div>
                      </div>
                    )}

                    {/* Complexity Analysis Cards */}
                    {(approach.timeComplexity || approach.spaceComplexity) && (
                      <div>
                        <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                          <ChevronRight size={16} className="text-teal-500" />
                          Complexity Analysis
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {approach.timeComplexity && (
                            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 flex items-center gap-3.5">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                <Clock size={20} />
                              </div>
                              <div>
                                <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                  Time Complexity
                                </span>
                                <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
                                  {approach.timeComplexity}
                                </span>
                              </div>
                            </div>
                          )}

                          {approach.spaceComplexity && (
                            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 flex items-center gap-3.5">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                <Database size={20} />
                              </div>
                              <div>
                                <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                  Space Complexity
                                </span>
                                <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
                                  {approach.spaceComplexity}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Multi-Language Code Implementation */}
                    {approach.codeSnippets && approach.codeSnippets.length > 0 && (
                      <div>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                            <ChevronRight size={16} className="text-teal-500" />
                            Code Implementation
                          </h4>

                          {/* Language Switcher Tabs */}
                          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-1">
                            {approach.codeSnippets.map((snippet) => (
                              <button
                                key={snippet.language}
                                type="button"
                                onClick={() => setTab(sectionKey, snippet.language)}
                                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                                  currentTabLang === snippet.language
                                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                              >
                                {snippet.language}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Syntax Highlighted Code Viewer */}
                        {currentSnippet && (
                          <CodeBlock
                            code={currentSnippet.code}
                            language={currentSnippet.language}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SolutionPage;
