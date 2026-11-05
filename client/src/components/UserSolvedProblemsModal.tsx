import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Trophy,
  Flame,
  Search,
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Calendar,
  AlertCircle,
  FileCode,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { apiUrl } from '../config';
import { getStoredUser } from '../utils/auth';

export interface SolvedProblemItem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  link: string;
  solutionLink?: string;
  tutorialLink?: string;
  videoSolutionUrl?: string;
  visualizerSlug?: string;
  hasVisualizer?: boolean;
  solvedAt?: string | null;
  order?: number;
}

export interface TopicBreakdownItem {
  topicSlug: string;
  topicName: string;
  iconKey: string;
  order: number;
  totalInTopic: number;
  solvedCount: number;
  problems: SolvedProblemItem[];
}

export interface UserProfileResponse {
  user: {
    username: string;
    role: string;
    createdAt: string;
    level: number;
    totalSolved: number;
    currentStreak: number;
    maxStreak: number;
    solvedProblems: string[];
    solvedHistory: Array<{ problemId: string; solvedAt: string }>;
  };
  topicBreakdown: TopicBreakdownItem[];
  solvedCount: number;
}

interface UserSolvedProblemsModalProps {
  username: string | null;
  isOpen: boolean;
  onClose: () => void;
  rank?: number;
}

const difficultyBadgeClass: Record<string, string> = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  Hard: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
};

export const UserSolvedProblemsModal: React.FC<UserSolvedProblemsModalProps> = ({
  username,
  isOpen,
  onClose,
  rank,
}) => {
  const [data, setData] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const currentUser = getStoredUser();
  const isSelf = currentUser && username && currentUser.username.toLowerCase() === username.toLowerCase();

  // Fetch profile when username changes or modal opens
  useEffect(() => {
    if (!isOpen || !username) {
      setData(null);
      setError(null);
      setSearch('');
      setDifficultyFilter('All');
      return;
    }

    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiUrl(`/api/auth/profile/${encodeURIComponent(username)}`));
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`Learner "${username}" was not found.`);
          }
          throw new Error('Failed to load user profile');
        }
        const json: UserProfileResponse = await res.json();
        if (isMounted) {
          setData(json);
          // By default, expand all topics that contain solved problems
          const topicsWithSolves = new Set(
            json.topicBreakdown.filter((t) => t.solvedCount > 0).map((t) => t.topicSlug)
          );
          setExpandedTopics(topicsWithSolves);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Unable to load profile');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [isOpen, username]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleTopic = (slug: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!data) return;
    setExpandedTopics(new Set(data.topicBreakdown.map((t) => t.topicSlug)));
  };

  const collapseAll = () => {
    setExpandedTopics(new Set());
  };

  // Filtered topic breakdown based on search and difficulty
  const filteredTopics = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();

    return data.topicBreakdown
      .map((topic) => {
        const matchingProblems = topic.problems.filter((p) => {
          const matchDifficulty =
            difficultyFilter === 'All' || p.difficulty === difficultyFilter;
          const matchQuery =
            !q ||
            p.title.toLowerCase().includes(q) ||
            String(p.id).includes(q) ||
            topic.topicName.toLowerCase().includes(q);
          return matchDifficulty && matchQuery;
        });

        return {
          ...topic,
          matchingProblems,
        };
      })
      .filter((topic) => {
        // If searching or filtering, only show topics with matching problems
        if (search.trim() || difficultyFilter !== 'All') {
          return topic.matchingProblems.length > 0;
        }
        // Otherwise, show topics that have at least 1 solved problem
        return topic.solvedCount > 0;
      });
  }, [data, search, difficultyFilter]);

  const totalMatchingProblems = useMemo(() => {
    return filteredTopics.reduce((sum, t) => sum + t.matchingProblems.length, 0);
  }, [filteredTopics]);

  // Total difficulty breakdown among solved
  const difficultyCounts = useMemo(() => {
    const counts = { All: 0, Easy: 0, Medium: 0, Hard: 0 };
    if (!data) return counts;
    for (const t of data.topicBreakdown) {
      for (const p of t.problems) {
        counts.All += 1;
        if (p.difficulty === 'Easy') counts.Easy += 1;
        else if (p.difficulty === 'Medium') counts.Medium += 1;
        else if (p.difficulty === 'Hard') counts.Hard += 1;
      }
    }
    return counts;
  }, [data]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="solved-modal-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4 sm:p-6">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            {/* Avatar Initial */}
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-md">
              {(username || 'U').charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="solved-modal-title" className="text-lg sm:text-2xl font-bold tracking-tight truncate">
                  {username}
                </h2>

                {isSelf && (
                  <span className="rounded border border-amber-500/40 bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-700 dark:text-amber-300">
                    YOU
                  </span>
                )}

                {rank && (
                  <span className="rounded-full border border-[var(--border-strong)] bg-[var(--bg-base)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]">
                    Rank #{rank}
                  </span>
                )}

                {data?.user?.level && (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    Lv. {data.user.level}
                  </span>
                )}
              </div>

              {/* Sub-pills */}
              <div className="mt-1 flex items-center gap-2 sm:gap-3 text-xs text-[var(--text-secondary)] flex-wrap">
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                  <Trophy size={13} className="text-amber-500 shrink-0" />
                  {data ? `${data.solvedCount} Solved` : 'Loading...'}
                </span>

                {data && data.user.maxStreak > 0 && (
                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                    <Flame size={13} className="text-amber-500 fill-amber-500 shrink-0" />
                    {data.user.maxStreak} Day Streak
                  </span>
                )}

                {data?.user?.createdAt && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[var(--text-muted)] text-[11px]">
                    <Calendar size={12} className="shrink-0" />
                    Joined {new Date(data.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Full profile + Close */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {username && (
              <Link
                to={`/profile/${encodeURIComponent(username)}`}
                onClick={onClose}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition"
                title="View full public profile page"
              >
                <span>Full Profile</span>
                <ArrowRight size={13} />
              </Link>
            )}

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-10">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Loading {username}&apos;s solved curriculum...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-rose-500/80" />
            <p className="text-sm font-bold text-[var(--text-primary)]">{error}</p>
            <button
              onClick={onClose}
              className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-1.5 text-xs font-semibold hover:bg-[var(--bg-surface-hover)]"
            >
              Close
            </button>
          </div>
        )}

        {/* Success Content */}
        {!loading && !error && data && (
          <>
            {/* Filter Controls Row */}
            <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search solved problems by title or #ID..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] py-1.5 pl-8 pr-7 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition focus:border-[var(--text-primary)] focus:ring-1 focus:ring-[var(--text-primary)]"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Difficulty Filter Chips + Expand/Collapse Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
                {/* Difficulty Pills */}
                <div className="inline-flex items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-0.5 text-[11px] font-semibold">
                  {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficultyFilter(diff)}
                      className={`rounded-lg px-2 py-1 transition ${
                        difficultyFilter === diff
                          ? 'bg-[var(--text-primary)] text-[var(--text-inverted)] shadow-xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {diff} <span className="opacity-70 text-[10px]">({difficultyCounts[diff]})</span>
                    </button>
                  ))}
                </div>

                {/* Expand / Collapse All */}
                <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                  <button
                    type="button"
                    onClick={expandAll}
                    className="rounded-lg px-2 py-1 hover:bg-[var(--bg-surface-hover)] transition"
                  >
                    Expand all
                  </button>
                  <span>/</span>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="rounded-lg px-2 py-1 hover:bg-[var(--bg-surface-hover)] transition"
                  >
                    Collapse all
                  </button>
                </div>
              </div>
            </div>

            {/* Solved Problems Topic-wise Accordion Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 max-h-[60vh]">
              {data.solvedCount === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <BookOpen size={32} className="mx-auto text-[var(--text-muted)]" />
                  <p className="font-bold text-sm text-[var(--text-primary)]">No problems solved yet</p>
                  <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                    {username} has not submitted any solutions to the practice sheet yet.
                  </p>
                </div>
              ) : filteredTopics.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Search size={28} className="mx-auto text-[var(--text-muted)]" />
                  <p className="font-bold text-sm text-[var(--text-primary)]">No matching problems found</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    No solved problems matched your search &quot;{search}&quot;
                    {difficultyFilter !== 'All' ? ` with ${difficultyFilter} difficulty.` : '.'}
                  </p>
                  <button
                    onClick={() => {
                      setSearch('');
                      setDifficultyFilter('All');
                    }}
                    className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
                    <span>
                      Showing <strong className="text-[var(--text-primary)]">{totalMatchingProblems}</strong> solved problems across{' '}
                      <strong className="text-[var(--text-primary)]">{filteredTopics.length}</strong> topics
                    </span>
                  </div>

                  {filteredTopics.map((topic) => {
                    const isExpanded = expandedTopics.has(topic.topicSlug);
                    const pct = topic.totalInTopic > 0
                      ? Math.round((topic.solvedCount / topic.totalInTopic) * 100)
                      : 0;

                    return (
                      <div
                        key={topic.topicSlug}
                        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] overflow-hidden transition-all shadow-xs"
                      >
                        {/* Topic Header Accordion Bar */}
                        <button
                          type="button"
                          onClick={() => toggleTopic(topic.topicSlug)}
                          className="w-full flex items-center justify-between p-3.5 sm:px-4 sm:py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] transition text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] shrink-0">
                              <Layers size={15} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                                  {topic.topicName}
                                </h3>
                                <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.2 text-[10px] font-bold">
                                  {topic.solvedCount}
                                  {topic.totalInTopic > 0 ? ` / ${topic.totalInTopic}` : ''} solved
                                </span>
                              </div>

                              {/* Mini progress bar */}
                              {topic.totalInTopic > 0 && (
                                <div className="mt-1 flex items-center gap-2">
                                  <div className="w-24 sm:w-36 h-1 rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-emerald-500"
                                      style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-medium text-[var(--text-muted)]">{pct}%</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 text-[var(--text-muted)]">
                            <span className="text-[11px] hidden sm:inline">
                              {topic.matchingProblems.length}{' '}
                              {topic.matchingProblems.length === 1 ? 'problem' : 'problems'}
                            </span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        {/* Topic Problems Grid */}
                        {isExpanded && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
                            {topic.matchingProblems.map((problem) => (
                              <div
                                key={problem.id}
                                className="flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] transition"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-mono text-[11px] font-bold text-[var(--text-muted)] bg-[var(--bg-surface-muted)] px-1.5 py-0.2 rounded border border-[var(--border-subtle)]">
                                        #{problem.id}
                                      </span>
                                      <span
                                        className={`rounded-full px-2 py-0.2 text-[10px] font-semibold border ${
                                          difficultyBadgeClass[problem.difficulty] || difficultyBadgeClass.Medium
                                        }`}
                                      >
                                        {problem.difficulty}
                                      </span>
                                    </div>
                                    {problem.hasVisualizer && (
                                      <span className="inline-flex items-center gap-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.2 text-[9px] font-bold dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20">
                                        <Sparkles size={9} />
                                        Visualizer
                                      </span>
                                    )}
                                  </div>

                                  <a
                                    href={problem.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-xs text-[var(--text-primary)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline line-clamp-2 leading-snug"
                                  >
                                    {problem.title}
                                  </a>

                                  {problem.solvedAt && (
                                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                                      Solved on {new Date(problem.solvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                  )}
                                </div>

                                <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1">
                                    {problem.visualizerSlug && (
                                      <Link
                                        to={`/visualizers/${encodeURIComponent(problem.visualizerSlug)}`}
                                        onClick={onClose}
                                        className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300 dark:hover:bg-teal-500/20 transition"
                                        title="Open Interactive Visualizer"
                                      >
                                        <Sparkles size={10} />
                                        <span>Animate</span>
                                      </Link>
                                    )}

                                    <Link
                                      to={`/problem/${problem.id}/solution`}
                                      onClick={onClose}
                                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition"
                                      title="View Code & Solution Approaches"
                                    >
                                      <FileCode size={10} />
                                      <span>Solution</span>
                                    </Link>
                                  </div>

                                  {problem.link && (
                                    <a
                                      href={problem.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center h-6 w-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition"
                                      title="Open practice problem on external platform"
                                    >
                                      <ExternalLink size={11} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </>
        )}

        {/* Modal Footer */}
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-4 py-3 sm:px-6 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="text-[11px] text-[var(--text-muted)]">
            Click any problem to view solution approaches or practice externally.
          </span>

          <div className="flex items-center gap-2">
            {username && (
              <Link
                to={`/profile/${encodeURIComponent(username)}`}
                onClick={onClose}
                className="inline-flex sm:hidden items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400"
              >
                <span>View Full Page</span>
                <ArrowRight size={12} />
              </Link>
            )}

            <button
              onClick={onClose}
              className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1 font-semibold hover:bg-[var(--bg-surface-hover)] transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSolvedProblemsModal;

