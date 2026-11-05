import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Mail,
  Calendar,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  ExternalLink,
  Sparkles,
  FileCode,
  Layers,
  BookOpen,
  Flame,
  Zap,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import { apiUrl } from '../config';
import { fetchPublicTopics } from '../utils/topicApi';
import { getCanonicalTopicSlug } from '../utils/topics';
import { type TopicDefinition } from '../data/topics';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  link: string;
  solutionLink?: string;
  visualizerSlug?: string;
  hasVisualizer?: boolean;
  order?: number;
}

interface UserData {
  username: string;
  email?: string;
  solvedProblems: string[];
  solvedHistory?: Array<{ problemId: string; solvedAt: string }>;
  createdAt: string;
  level?: number;
  role?: string;
}

interface HeatmapDay {
  date: Date;
  key: string;
  count: number;
  month: number;
}

const difficultyStyle: Record<string, string> = { 
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', 
  Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', 
  Hard: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' 
};

const PROBLEMS_PER_PAGE = 8;

const ProfilePage: React.FC = () => {
  const { username: paramUsername } = useParams<{ username?: string }>();
  const [user, setUser] = useState<UserData | null>(null);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [topicCatalog, setTopicCatalog] = useState<TopicDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  // Solved explorer state
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string>('all');
  const [topicSearch, setTopicSearch] = useState('');
  const [problemSearch, setProblemSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [problemPage, setProblemPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (paramUsername) {
          // Public profile view for requested username
          const [userRes, probRes, topics] = await Promise.all([
            fetch(apiUrl(`/api/auth/profile/${encodeURIComponent(paramUsername)}`)),
            fetch(apiUrl('/api/problems/all')),
            fetchPublicTopics(),
          ]);

          if (!userRes.ok) {
            if (isMounted) setUser(null);
            return;
          }

          const profileData = await userRes.json();
          const probData = await probRes.json();

          if (isMounted) {
            setUser({
              username: profileData.user.username,
              solvedProblems: profileData.user.solvedProblems || [],
              solvedHistory: profileData.user.solvedHistory || [],
              createdAt: profileData.user.createdAt,
              level: profileData.user.level,
              role: profileData.user.role,
            });

            if (probRes.ok) setAllProblems(probData);
            setTopicCatalog(topics);
          }
        } else {
          // Own profile view
          if (!token) {
            if (isMounted) setUser(null);
            return;
          }

          const [userRes, probRes, topics] = await Promise.all([
            fetch(apiUrl('/api/auth/me'), { headers: { 'x-auth-token': token } }),
            fetch(apiUrl('/api/problems/all')),
            fetchPublicTopics(),
          ]);

          const userData = await userRes.json();
          const probData = await probRes.json();

          if (isMounted) {
            if (userRes.ok) setUser(userData);
            if (probRes.ok) setAllProblems(probData);
            setTopicCatalog(topics);
          }
        }
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [paramUsername]);

  // Reset problem page when filters change
  useEffect(() => {
    setProblemPage(1);
  }, [selectedTopicSlug, problemSearch, difficultyFilter]);

  const heatmapData = useMemo(() => {
    if (!user) {
      return null;
    }

    const toDateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const solvedHistory = Array.isArray(user.solvedHistory) ? user.solvedHistory : [];
    const countsByDay = new Map<string, number>();
    solvedHistory.forEach((entry) => {
      if (!entry?.solvedAt) return;
      const solvedDate = new Date(entry.solvedAt);
      const dayKey = toDateKey(solvedDate);
      countsByDay.set(dayKey, (countsByDay.get(dayKey) || 0) + 1);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate 52 weeks ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (52 * 7) + 1);
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const weeks: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= today) {
      const key = toDateKey(currentDate);
      currentWeek.push({
        date: new Date(currentDate),
        key,
        count: countsByDay.get(key) || 0,
        month: currentDate.getMonth(),
      });

      if (currentDate.getDay() === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const nextDate = new Date(currentWeek[currentWeek.length - 1].date);
        nextDate.setDate(nextDate.getDate() + 1);
        currentWeek.push({
          date: nextDate,
          key: toDateKey(nextDate),
          count: 0,
          month: nextDate.getMonth()
        });
      }
      weeks.push(currentWeek);
    }

    const monthLabels: { label: string; index: number }[] = [];
    let lastMonth = -1;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    weeks.forEach((week, index) => {
      const month = week[0].month;
      if (month !== lastMonth) {
        if (index > 0 || week[0].date.getDate() <= 14) {
          monthLabels.push({ label: monthNames[month], index });
        }
        lastMonth = month;
      }
    });

    let currentStreak = 0;
    let maxStreak = 0;
    let streakDate = new Date(today);

    while (true) {
       const key = toDateKey(streakDate);
       if ((countsByDay.get(key) || 0) > 0) {
          currentStreak++;
          streakDate.setDate(streakDate.getDate() - 1);
       } else {
           if (currentStreak === 0 && streakDate.getTime() === today.getTime()) {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const yKey = toDateKey(yesterday);
                if ((countsByDay.get(yKey) || 0) > 0) {
                    currentStreak++;
                    streakDate = yesterday;
                    streakDate.setDate(streakDate.getDate() - 1);
                    continue;
                }
           }
           break;
       }
    }

    const sortedDates = Array.from(countsByDay.keys()).sort();
    let tempStreak = 0;
    let previousDate: Date | null = null;

    for (const dateStr of sortedDates) {
         const d = new Date(dateStr);
         if (!previousDate) {
             tempStreak = 1;
         } else {
             const diffTime = Math.abs(d.getTime() - previousDate.getTime());
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             if (diffDays === 1) {
                 tempStreak++;
             } else {
                 tempStreak = 1;
             }
         }
         if (tempStreak > maxStreak) {
             maxStreak = tempStreak;
         }
         previousDate = d;
    }

    return {
      weeks,
      monthLabels,
      currentStreak,
      maxStreak,
      countsByDay
    };
  }, [user]);

  const getColorClass = (count: number, isFuture: boolean) => {
    if (isFuture) return 'bg-transparent';
    if (count === 0) return 'bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]';
    if (count <= 2) return 'bg-[var(--text-primary)] opacity-40 border border-[var(--bg-base)]';
    if (count <= 4) return 'bg-[var(--text-primary)] opacity-70 border border-[var(--bg-base)]';
    return 'bg-[var(--text-primary)] border border-[var(--bg-base)]';
  };

  const difficultyStats = useMemo(() => {
    if (!user || allProblems.length === 0) {
      return { 
        Easy: { total: 0, solved: 0 }, 
        Medium: { total: 0, solved: 0 }, 
        Hard: { total: 0, solved: 0 } 
      };
    }
    
    const stats = {
      Easy: { total: 0, solved: 0 },
      Medium: { total: 0, solved: 0 },
      Hard: { total: 0, solved: 0 }
    };

    const solvedSet = new Set(user.solvedProblems);

    allProblems.forEach(p => {
       if (stats[p.difficulty]) {
           stats[p.difficulty].total++;
           if (solvedSet.has(String(p.id))) {
               stats[p.difficulty].solved++;
           }
       }
    });

    return stats;
  }, [user, allProblems]);

  // Topic progress and metrics
  const topicSummaries = useMemo(() => {
    if (!user || topicCatalog.length === 0) return [];

    const solvedSet = new Set(user.solvedProblems);

    return topicCatalog.map((topic) => {
      const canonicalTopicSlug = getCanonicalTopicSlug(topic.slug);
      const topicProbs = allProblems.filter((p) => {
        const pSlug = getCanonicalTopicSlug(p.topic);
        return pSlug === canonicalTopicSlug || p.topic.toLowerCase() === topic.name.toLowerCase();
      });

      const solvedTopicProbs = topicProbs.filter((p) => solvedSet.has(String(p.id)));

      return {
        id: topic.id || topic.slug,
        name: topic.name,
        slug: topic.slug,
        total: topicProbs.length,
        solved: solvedTopicProbs.length,
        percentage: topicProbs.length > 0 ? (solvedTopicProbs.length / topicProbs.length) * 100 : 0,
      };
    });
  }, [user, allProblems, topicCatalog]);

  // Filtered topics for the sidebar
  const filteredTopics = useMemo(() => {
    const q = topicSearch.trim().toLowerCase();
    if (!q) return topicSummaries;
    return topicSummaries.filter(
      (t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
    );
  }, [topicSummaries, topicSearch]);

  // Solved problems filtered by selected topic, difficulty, and problem search query
  const solvedProblemsList = useMemo(() => {
    if (!user || allProblems.length === 0) return [];

    const solvedSet = new Set(user.solvedProblems);
    const solvedAtMap = new Map<string, string>();
    (user.solvedHistory || []).forEach((h) => {
      if (h.problemId) {
        solvedAtMap.set(String(h.problemId), h.solvedAt);
      }
    });

    const canonicalSelected = getCanonicalTopicSlug(selectedTopicSlug);
    const q = problemSearch.trim().toLowerCase();

    return allProblems
      .filter((p) => solvedSet.has(String(p.id)))
      .filter((p) => {
        if (selectedTopicSlug === 'all') return true;
        const pSlug = getCanonicalTopicSlug(p.topic);
        return pSlug === canonicalSelected || p.topic.toLowerCase() === selectedTopicSlug.toLowerCase();
      })
      .filter((p) => {
        if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) {
          return false;
        }
        if (q) {
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchId = String(p.id).includes(q);
          const matchTopic = p.topic.toLowerCase().includes(q);
          return matchTitle || matchId || matchTopic;
        }
        return true;
      })
      .map((p) => ({
        ...p,
        solvedAt: solvedAtMap.get(String(p.id)) || null,
      }))
      .sort((a, b) => {
        // Sort by solvedAt descending if available, otherwise by problem order/ID
        if (a.solvedAt && b.solvedAt) {
          return new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime();
        }
        return (a.order || a.id) - (b.order || b.id);
      });
  }, [user, allProblems, selectedTopicSlug, difficultyFilter, problemSearch]);

  // Pagination for problems
  const totalPages = Math.max(1, Math.ceil(solvedProblemsList.length / PROBLEMS_PER_PAGE));
  const paginatedProblems = useMemo(() => {
    const start = (problemPage - 1) * PROBLEMS_PER_PAGE;
    return solvedProblemsList.slice(start, start + PROBLEMS_PER_PAGE);
  }, [solvedProblemsList, problemPage]);

  // Active topic metadata
  const activeTopicInfo = useMemo(() => {
    if (selectedTopicSlug === 'all') {
      return {
        name: 'All Solved Problems',
        solved: user?.solvedProblems.length || 0,
        total: allProblems.length,
        isAll: true,
      };
    }
    const found = topicSummaries.find(
      (t) => getCanonicalTopicSlug(t.slug) === getCanonicalTopicSlug(selectedTopicSlug)
    );
    return {
      name: found ? found.name : selectedTopicSlug,
      solved: found ? found.solved : 0,
      total: found ? found.total : 0,
      isAll: false,
    };
  }, [selectedTopicSlug, topicSummaries, user, allProblems]);

  if (loading) {
     return (
       <div className="page-shell flex min-h-screen items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)]"></div>
       </div>
     );
  }

  if (!user) {
    return (
       <div className="page-shell">
         <AnimatedBackground />
         <div className="page-wrap py-20 text-center">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {paramUsername ? `Learner "${paramUsername}" not found.` : 'Please sign in to view your profile.'}
            </h1>
            <div className="mt-4">
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold hover:bg-[var(--bg-surface-hover)] transition"
              >
                Back to Leaderboard
              </Link>
            </div>
         </div>
       </div>
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const totalProblemsCount = allProblems.length;
  const overallCompletionPct = totalProblemsCount > 0 ? ((user.solvedProblems.length / totalProblemsCount) * 100).toFixed(1) : '0';

  return (
    <div className="page-shell">
      <AnimatedBackground />
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* ========================================================= */}
        {/* 1. PROFILE HEADER HERO */}
        {/* ========================================================= */}
        <div className="mb-8 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-sm)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase tracking-wider shadow-md shrink-0">
                {user.username.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] truncate">
                    {user.username}
                  </h1>
                  {user.level && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Lv. {user.level}
                    </span>
                  )}
                  {user.role && user.role !== 'user' && (
                    <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                      {user.role}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-4 text-xs sm:text-sm text-[var(--text-secondary)] flex-wrap">
                  {user.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail size={14} className="text-[var(--text-muted)]" /> {user.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[var(--text-muted)]" /> Joined {joinDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-base)] px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition shadow-xs"
              >
                <Trophy size={14} className="text-amber-500" />
                <span>Leaderboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. TOP DASHBOARD GRID: STATS (4 cols) + HEATMAP (8 cols) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Solved Progress & Difficulty Breakdown Card (col-span-4) */}
          <section className="lg:col-span-4 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[var(--border-subtle)] mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[var(--bg-surface-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                    <Trophy size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Solved Progress
                    </h2>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                        {user.solvedProblems.length}
                      </span>
                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        / {totalProblemsCount} total
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {overallCompletionPct}%
                  </span>
                </div>
              </div>

              {/* Difficulty Breakdown Bars */}
              <div className="space-y-4">
                {(['Easy', 'Medium', 'Hard'] as const).map((diff) => {
                  const stats = difficultyStats[diff];
                  const pct = stats.total > 0 ? (stats.solved / stats.total) * 100 : 0;
                  const color = diff === 'Easy' ? 'bg-emerald-500' : diff === 'Medium' ? 'bg-amber-500' : 'bg-rose-500';
                  
                  return (
                    <div key={diff}>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${color}`} />
                          {diff}
                        </span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {stats.solved} <span className="text-[var(--text-muted)] font-normal">/ {stats.total}</span>
                          <span className="ml-1 text-[10px] text-[var(--text-muted)]">({pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overall Completion Percentage footer */}
            <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>DSA Sheet Curriculum</span>
              <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-500" />
                {user.solvedProblems.length} Solved
              </span>
            </div>
          </section>

          {/* Activity Heatmap & Streaks Card (col-span-8) */}
          {heatmapData && (
            <section className="lg:col-span-8 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)] flex flex-col justify-between">
              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Calendar size={18} className="text-emerald-500" /> Activity History
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Daily problem submissions over the past 52 weeks
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">
                    {user.solvedProblems.length} submissions in past year
                  </div>
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="min-w-max flex gap-2">
                    {/* Weekday Labels */}
                    <div className="flex flex-col gap-[3px] text-[10px] font-medium text-[var(--text-muted)] mt-[26px]">
                      <div className="h-3 flex items-center justify-end pr-1">Sun</div>
                      <div className="h-3 flex items-center justify-end pr-1">Mon</div>
                      <div className="h-3 flex items-center justify-end pr-1">Tue</div>
                      <div className="h-3 flex items-center justify-end pr-1">Wed</div>
                      <div className="h-3 flex items-center justify-end pr-1">Thu</div>
                      <div className="h-3 flex items-center justify-end pr-1">Fri</div>
                      <div className="h-3 flex items-center justify-end pr-1">Sat</div>
                    </div>

                    <div>
                      <div className="relative flex h-5 mb-1.5 text-[10px] font-medium text-[var(--text-muted)]">
                        {heatmapData.monthLabels.map(m => (
                          <div 
                            key={m.index} 
                            className="absolute"
                            style={{ left: `${m.index * 15}px` }}
                          >
                            {m.label}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-[3px]">
                        {heatmapData.weeks.map((week, i) => (
                          <div key={i} className="flex flex-col gap-[3px]">
                            {week.map((day) => {
                              const isFuture = day.date > new Date();
                              return (
                                <div 
                                  key={day.key} 
                                  className={`w-3 h-3 rounded-[2px] ${getColorClass(day.count, isFuture)} ${!isFuture && 'transition-transform hover:scale-125 cursor-pointer'}`}
                                  title={isFuture ? undefined : `${day.count} submissions on ${day.date.toDateString()}`}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Streaks and legend footer */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-4 text-sm">
                <div className="flex gap-6">
                  <div>
                    <p className="text-[var(--text-muted)] text-[11px] font-medium">Current Streak</p>
                    <p className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1 mt-0.5">
                      <Flame size={15} className="text-amber-500" />
                      <span>{heatmapData.currentStreak} {heatmapData.currentStreak === 1 ? 'day' : 'days'}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-[11px] font-medium">Max Streak</p>
                    <p className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1 mt-0.5">
                      <Zap size={15} className="text-emerald-500" />
                      <span>{heatmapData.maxStreak} {heatmapData.maxStreak === 1 ? 'day' : 'days'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--text-muted)]">
                  Less
                  <div className="flex gap-[3px]">
                    {[0, 1, 3, 5].map(c => (
                      <div key={c} className={`w-3 h-3 rounded-[2px] ${getColorClass(c, false)}`} />
                    ))}
                  </div>
                  More
                </div>
              </div>
            </section>
          )}

        </div>

        {/* ========================================================= */}
        {/* 3. MASTER-DETAIL CURRICULUM & SOLVED PROBLEMS EXPLORER    */}
        {/* ========================================================= */}
        <section className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <BookOpen size={19} className="text-emerald-500" /> Curriculum & Solved Problems Explorer
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Browse completed problems by topic or view all practice history with instant search and filtering.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-[var(--text-secondary)]">Total Solved:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {user.solvedProblems.length} Problems
              </span>
            </div>
          </div>

          {/* Mobile Topic Scroller (Shown on small screens) */}
          <div className="lg:hidden mt-4 overflow-x-auto pb-2 flex items-center gap-2 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedTopicSlug('all')}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                selectedTopicSlug === 'all'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverted)] border-[var(--text-primary)] shadow-xs'
                  : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              All Topics ({user.solvedProblems.length})
            </button>
            {topicSummaries.map((topic) => (
              <button
                key={topic.slug}
                type="button"
                onClick={() => setSelectedTopicSlug(topic.slug)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                  selectedTopicSlug === topic.slug
                    ? 'bg-[var(--text-primary)] text-[var(--text-inverted)] border-[var(--text-primary)] shadow-xs'
                    : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                <span>{topic.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedTopicSlug === topic.slug
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--bg-surface-muted)] text-[var(--text-muted)]'
                }`}>
                  {topic.solved}
                </span>
              </button>
            ))}
          </div>

          {/* Master-Detail Dual Pane Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
            
            {/* Desktop Left Sidebar: Topic Selector & Progress List (col-span-4) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-3.5">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Layers size={15} className="text-emerald-500" />
                  <span className="font-bold text-xs text-[var(--text-primary)]">Topics Overview</span>
                </div>
                <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-surface-muted)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)]">
                  {topicCatalog.length} topics
                </span>
              </div>

              {/* Topic search filter */}
              <div className="relative mb-3">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                />
                <input
                  type="text"
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  placeholder="Filter topics..."
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1.5 pl-7 pr-6 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition focus:border-[var(--text-primary)]"
                />
                {topicSearch && (
                  <button
                    onClick={() => setTopicSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Scrollable list of topics */}
              <div className="space-y-1 overflow-y-auto max-h-[540px] pr-1">
                {/* All Topics master option */}
                <button
                  type="button"
                  onClick={() => setSelectedTopicSlug('all')}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                    selectedTopicSlug === 'all'
                      ? 'bg-[var(--bg-surface)] border-[var(--border-strong)] shadow-xs ring-1 ring-[var(--text-primary)]/20'
                      : 'border-transparent hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] shrink-0">
                      <BookOpen size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[var(--text-primary)] truncate">All Solved Problems</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Complete catalog history</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                    {user.solvedProblems.length}
                  </span>
                </button>

                {/* Individual Topics */}
                {filteredTopics.map((topic) => {
                  const isSelected = selectedTopicSlug === topic.slug;
                  const pct = topic.total > 0 ? Math.round((topic.solved / topic.total) * 100) : 0;
                  
                  return (
                    <button
                      key={topic.slug}
                      type="button"
                      onClick={() => setSelectedTopicSlug(topic.slug)}
                      className={`w-full text-left p-2.5 rounded-xl border transition ${
                        isSelected
                          ? 'bg-[var(--bg-surface)] border-[var(--border-strong)] shadow-xs ring-1 ring-[var(--text-primary)]/20'
                          : 'border-transparent hover:bg-[var(--bg-surface)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                          {topic.name}
                        </span>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] shrink-0">
                          {topic.solved} <span className="font-normal opacity-70">/ {topic.total}</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-[var(--text-primary)]' : 'bg-transparent'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Pane: Solved Problems Grid & Controls (col-span-8) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col justify-between min-h-[480px]">
              <div>
                
                {/* Explorer Controls Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[var(--text-primary)] truncate">
                        {activeTopicInfo.name}
                      </h3>
                      <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.2 text-[10px] font-bold shrink-0">
                        {activeTopicInfo.solved} {activeTopicInfo.isAll ? 'solved' : `/ ${activeTopicInfo.total} solved`}
                      </span>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative w-full sm:w-48">
                      <Search
                        size={12}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                      <input
                        type="text"
                        value={problemSearch}
                        onChange={(e) => setProblemSearch(e.target.value)}
                        placeholder="Search problems..."
                        className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1 pl-7 pr-6 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition focus:border-[var(--text-primary)]"
                      />
                      {problemSearch && (
                        <button
                          onClick={() => setProblemSearch('')}
                          aria-label="Clear search"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Difficulty Chips */}
                    <div className="inline-flex items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-0.5 text-[11px] font-semibold">
                      {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setDifficultyFilter(diff)}
                          className={`rounded-md px-2 py-0.5 transition ${
                            difficultyFilter === diff
                              ? 'bg-[var(--text-primary)] text-[var(--text-inverted)] shadow-xs'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Problems Content */}
                {user.solvedProblems.length === 0 ? (
                  <div className="py-16 text-center space-y-3 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-base)]">
                    <BookOpen size={32} className="mx-auto text-[var(--text-muted)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">No problems solved yet</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
                        Practice and complete questions from the DSA Sheet to track your progress here.
                      </p>
                    </div>
                    <Link
                      to="/topic/basics"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition"
                    >
                      <span>Start with Basics</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                ) : solvedProblemsList.length === 0 ? (
                  <div className="py-16 text-center space-y-3 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-base)]">
                    <Search size={28} className="mx-auto text-[var(--text-muted)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {activeTopicInfo.solved === 0
                          ? `No problems solved in ${activeTopicInfo.name} yet`
                          : 'No matching solved problems found'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
                        {activeTopicInfo.solved === 0
                          ? `Dive into ${activeTopicInfo.name} to solve your first problem in this pillar!`
                          : 'Try modifying your search term or difficulty filter.'}
                      </p>
                    </div>
                    {activeTopicInfo.solved === 0 && !activeTopicInfo.isAll ? (
                      <Link
                        to={`/topic/${selectedTopicSlug}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition"
                      >
                        <span>Practice {activeTopicInfo.name}</span>
                        <ArrowRight size={13} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setProblemSearch('');
                          setDifficultyFilter('All');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                ) : (
                  /* 2-Column Responsive Problem Cards Grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paginatedProblems.map((problem) => (
                      <div
                        key={problem.id}
                        className="group relative flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-3.5 hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface)] transition shadow-xs"
                      >
                        <div>
                          {/* Card Header: ID + Difficulty + Visualizer Pill */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[11px] font-bold text-[var(--text-muted)] bg-[var(--bg-surface-muted)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                                #{problem.id}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.2 text-[10px] font-semibold border ${
                                  difficultyStyle[problem.difficulty] || difficultyStyle.Medium
                                }`}
                              >
                                {problem.difficulty}
                              </span>
                            </div>

                            {problem.hasVisualizer && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 px-2 py-0.2 text-[9px] font-bold">
                                <Sparkles size={10} />
                                Visualizer
                              </span>
                            )}
                          </div>

                          {/* Problem Title */}
                          <h4 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                            <a
                              href={problem.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {problem.title}
                            </a>
                          </h4>

                          {/* Problem Metadata: Topic & Solved Date */}
                          <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-[var(--text-muted)] flex-wrap">
                            <span className="truncate max-w-[130px] font-medium text-[var(--text-secondary)]">
                              {problem.topic}
                            </span>
                            {problem.solvedAt && (
                              <span>
                                Solved {new Date(problem.solvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Action Bar */}
                        <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            {problem.visualizerSlug && (
                              <Link
                                to={`/visualizers/${encodeURIComponent(problem.visualizerSlug)}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2 py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 transition"
                                title="Open Interactive Visualizer"
                              >
                                <Sparkles size={11} />
                                <span>Animate</span>
                              </Link>
                            )}

                            <Link
                              to={`/problem/${problem.id}/solution`}
                              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-2 py-1 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition"
                              title="View Solution Approaches"
                            >
                              <FileCode size={11} />
                              <span>Solution</span>
                            </Link>
                          </div>

                          {problem.link && (
                            <a
                              href={problem.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center h-6 w-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition"
                              title="Practice on external platform"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Problem Pagination Controls */}
              {solvedProblemsList.length > PROBLEMS_PER_PAGE && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    Showing {(problemPage - 1) * PROBLEMS_PER_PAGE + 1} to{' '}
                    {Math.min(problemPage * PROBLEMS_PER_PAGE, solvedProblemsList.length)} of{' '}
                    {solvedProblemsList.length} problems
                  </span>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setProblemPage((p) => Math.max(1, p - 1))}
                      disabled={problemPage === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      // Display limited pages around current page if total pages is large
                      if (
                        totalPages > 6 &&
                        pageNum !== 1 &&
                        pageNum !== totalPages &&
                        Math.abs(pageNum - problemPage) > 1
                      ) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return (
                            <span key={pageNum} className="px-1 text-xs text-[var(--text-muted)]">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setProblemPage(pageNum)}
                          className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition ${
                            problemPage === pageNum
                              ? 'bg-[var(--text-primary)] text-[var(--text-inverted)] shadow-xs'
                              : 'border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setProblemPage((p) => Math.min(totalPages, p + 1))}
                      disabled={problemPage >= totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </section>

      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
