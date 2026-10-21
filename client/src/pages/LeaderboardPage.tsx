import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Calendar,
  Search,
  ChevronRight,
  ChevronLeft,
  Target,
  BarChart2,
  ArrowUpDown,
  Loader2,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import { apiUrl } from '../config';
import { getStoredToken, getStoredUser } from '../utils/auth';

interface LeaderboardUser {
  rank: number;
  username: string;
  totalSolved: number;
  solvedThisWeek: number;
  solvedThisMonth: number;
  solvedCount: number;
  score: number;
  maxStreak: number;
  currentStreak: number;
  lastSolvedAt: string | null;
  createdAt: string | null;
  level: number;
}

interface LeaderboardSummary {
  totalLearners: number;
  totalSolved: number;
  topStreak: number;
  lastUpdated: string;
}

interface LeaderboardSettings {
  isLeaderboardEnabled: boolean;
  isPodiumEnabled: boolean;
  isSummaryStatsEnabled: boolean;
  showStatActiveLearners: boolean;
  showStatTotalSolved: boolean;
  showStatTopStreak: boolean;
  showStatLastUpdated: boolean;
  showWeeklyFilter: boolean;
  showMonthlyFilter: boolean;
  showStreakColumn: boolean;
  showThisWeekColumn: boolean;
  showLastSolvedColumn: boolean;
  showLevelBadge: boolean;
  isSearchEnabled: boolean;
  rowsPerPage: number;
  defaultPeriod: 'all' | 'weekly' | 'monthly';
  showZeroSolves: boolean;
  tieBreaker: 'earliest_solve' | 'account_age' | 'alphabetical';
}

interface LeaderboardResponse {
  isEnabled: boolean;
  period: 'all' | 'weekly' | 'monthly';
  summary: LeaderboardSummary;
  podium: LeaderboardUser[];
  users: LeaderboardUser[];
  currentUser: LeaderboardUser | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  settings: LeaderboardSettings;
  isServerPaginated?: boolean;
}

const DEFAULT_LEADERBOARD_SETTINGS: LeaderboardSettings = {
  isLeaderboardEnabled: true,
  isPodiumEnabled: true,
  isSummaryStatsEnabled: true,
  showStatActiveLearners: true,
  showStatTotalSolved: true,
  showStatTopStreak: true,
  showStatLastUpdated: true,
  showWeeklyFilter: true,
  showMonthlyFilter: true,
  showStreakColumn: true,
  showThisWeekColumn: true,
  showLastSolvedColumn: true,
  showLevelBadge: true,
  isSearchEnabled: true,
  rowsPerPage: 15,
  defaultPeriod: 'all',
  showZeroSolves: true,
  tieBreaker: 'earliest_solve',
};

function normalizeLeaderboardResponse(
  raw: any,
  period: 'all' | 'weekly' | 'monthly' = 'all'
): LeaderboardResponse {
  if (!raw) {
    return {
      isEnabled: true,
      period,
      summary: { totalLearners: 0, totalSolved: 0, topStreak: 0, lastUpdated: new Date().toISOString() },
      podium: [],
      users: [],
      currentUser: null,
      pagination: { total: 0, page: 1, limit: 25, pages: 1 },
      settings: DEFAULT_LEADERBOARD_SETTINGS,
    };
  }

  // 1. Rich object format from new backend
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const rawUsers: LeaderboardUser[] = Array.isArray(raw.users)
      ? raw.users.map((u: any, idx: number) => ({
          rank: typeof u.rank === 'number' ? u.rank : idx + 1,
          username: u.username || 'Anonymous',
          totalSolved: typeof u.totalSolved === 'number' ? u.totalSolved : (u.solvedCount || 0),
          solvedThisWeek: typeof u.solvedThisWeek === 'number' ? u.solvedThisWeek : 0,
          solvedThisMonth: typeof u.solvedThisMonth === 'number' ? u.solvedThisMonth : 0,
          solvedCount: typeof u.solvedCount === 'number' ? u.solvedCount : (u.totalSolved || 0),
          score: typeof u.score === 'number' ? u.score : (u.solvedCount || u.totalSolved || 0),
          maxStreak: typeof u.maxStreak === 'number' ? u.maxStreak : 0,
          currentStreak: typeof u.currentStreak === 'number' ? u.currentStreak : 0,
          lastSolvedAt: u.lastSolvedAt || null,
          createdAt: u.createdAt || null,
          level: typeof u.level === 'number' ? u.level : Math.max(1, Math.floor(Math.sqrt((u.solvedCount || u.totalSolved || 0) * 0.45)) + 1),
        }))
      : [];

    const rawPodium: LeaderboardUser[] = Array.isArray(raw.podium) && raw.podium.length > 0
      ? raw.podium.map((u: any, idx: number) => ({
          rank: typeof u.rank === 'number' ? u.rank : idx + 1,
          username: u.username || 'Anonymous',
          totalSolved: typeof u.totalSolved === 'number' ? u.totalSolved : (u.solvedCount || 0),
          solvedThisWeek: typeof u.solvedThisWeek === 'number' ? u.solvedThisWeek : 0,
          solvedThisMonth: typeof u.solvedThisMonth === 'number' ? u.solvedThisMonth : 0,
          solvedCount: typeof u.solvedCount === 'number' ? u.solvedCount : (u.totalSolved || 0),
          score: typeof u.score === 'number' ? u.score : (u.solvedCount || u.totalSolved || 0),
          maxStreak: typeof u.maxStreak === 'number' ? u.maxStreak : 0,
          currentStreak: typeof u.currentStreak === 'number' ? u.currentStreak : 0,
          lastSolvedAt: u.lastSolvedAt || null,
          createdAt: u.createdAt || null,
          level: typeof u.level === 'number' ? u.level : Math.max(1, Math.floor(Math.sqrt((u.solvedCount || u.totalSolved || 0) * 0.45)) + 1),
        }))
      : rawUsers.slice(0, 3);

    return {
      isEnabled: raw.isEnabled !== false,
      period: raw.period || period,
      summary: {
        totalLearners: raw.summary?.totalLearners ?? rawUsers.length,
        totalSolved: raw.summary?.totalSolved ?? rawUsers.reduce((acc, u) => acc + (u.totalSolved || 0), 0),
        topStreak: raw.summary?.topStreak ?? Math.max(0, ...rawUsers.map((u) => u.maxStreak || 0)),
        lastUpdated: raw.summary?.lastUpdated || new Date().toISOString(),
      },
      podium: rawPodium,
      users: rawUsers,
      currentUser: raw.currentUser || null,
      pagination: raw.pagination || {
        total: rawUsers.length,
        page: 1,
        limit: 15,
        pages: Math.max(1, Math.ceil(rawUsers.length / 15)),
      },
      settings: { ...DEFAULT_LEADERBOARD_SETTINGS, ...(raw.settings || {}) },
      isServerPaginated: Boolean(
        raw.pagination &&
        typeof raw.pagination === 'object' &&
        typeof raw.pagination.pages === 'number'
      ),
    };
  }

  // 2. Legacy array format (e.g. from deployed backend on Render)
  if (Array.isArray(raw)) {
    const users: LeaderboardUser[] = raw.map((u: any, idx: number) => {
      const solved = typeof u.solvedCount === 'number'
        ? u.solvedCount
        : Array.isArray(u.solvedProblems)
        ? u.solvedProblems.length
        : typeof u.totalSolved === 'number'
        ? u.totalSolved
        : 0;

      return {
        rank: typeof u.rank === 'number' ? u.rank : idx + 1,
        username: u.username || 'Anonymous',
        totalSolved: solved,
        solvedThisWeek: typeof u.solvedThisWeek === 'number' ? u.solvedThisWeek : 0,
        solvedThisMonth: typeof u.solvedThisMonth === 'number' ? u.solvedThisMonth : 0,
        solvedCount: solved,
        score: solved,
        maxStreak: typeof u.maxStreak === 'number' ? u.maxStreak : 0,
        currentStreak: typeof u.currentStreak === 'number' ? u.currentStreak : 0,
        lastSolvedAt: u.lastSolvedAt || null,
        createdAt: u.createdAt || null,
        level: typeof u.level === 'number' ? u.level : Math.max(1, Math.floor(Math.sqrt(solved * 0.45)) + 1),
      };
    });

    const podium = users.slice(0, 3);
    const totalSolvedSum = users.reduce((sum, u) => sum + u.totalSolved, 0);
    const topStreakVal = Math.max(0, ...users.map((u) => u.maxStreak || 0));

    return {
      isEnabled: true,
      period,
      summary: {
        totalLearners: users.length,
        totalSolved: totalSolvedSum,
        topStreak: topStreakVal,
        lastUpdated: new Date().toISOString(),
      },
      podium,
      users,
      currentUser: null,
      pagination: {
        total: users.length,
        page: 1,
        limit: 15,
        pages: Math.max(1, Math.ceil(users.length / 15)),
      },
      settings: DEFAULT_LEADERBOARD_SETTINGS,
      isServerPaginated: false,
    };
  }

  return {
    isEnabled: true,
    period,
    summary: { totalLearners: 0, totalSolved: 0, topStreak: 0, lastUpdated: new Date().toISOString() },
    podium: [],
    users: [],
    currentUser: null,
    pagination: { total: 0, page: 1, limit: 25, pages: 1 },
    settings: DEFAULT_LEADERBOARD_SETTINGS,
  };
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


// Medal component for Podium cards
const PodiumMedal: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) {
    return (
      <div className="relative flex flex-col items-center select-none shrink-0">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-[#3d2403] font-black text-sm shadow-[0_0_15px_rgba(245,158,11,0.5)] border-2 border-amber-200">
          <Crown size={12} className="absolute -top-1.5 text-amber-300 fill-amber-300 drop-shadow" />
          <span>1</span>
        </div>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="relative flex flex-col items-center select-none shrink-0">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-800 font-black text-xs shadow-[0_0_12px_rgba(203,213,225,0.4)] border-2 border-slate-100">
          <span>2</span>
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex flex-col items-center select-none shrink-0">
      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-amber-100 font-black text-xs shadow-[0_0_12px_rgba(180,83,9,0.35)] border-2 border-amber-500/60">
        <span>3</span>
      </div>
    </div>
  );
};

// Podium Card Component - Streamlined & Compact
const PodiumCard: React.FC<{
  user: LeaderboardUser;
  rank: number;
  periodLabel: string;
  showLevel: boolean;
}> = ({ user, rank, periodLabel, showLevel }) => {
  const isFirst = rank === 1;

  const cardBorderClass =
    rank === 1
      ? 'border-amber-400/50 bg-gradient-to-b from-amber-500/10 via-[var(--bg-surface)] to-[var(--bg-surface)] shadow-[var(--shadow-sm)] ring-1 ring-amber-400/30'
      : 'border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]';

  const avatarBgClass =
    rank === 1
      ? 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-50 dark:text-slate-900'
      : rank === 2
      ? 'bg-slate-200 text-slate-900 border-slate-300 dark:bg-slate-100 dark:text-slate-900'
      : 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-100/90 dark:text-amber-950';

  return (
    <div className={`w-full ${isFirst ? 'md:-translate-y-1' : ''}`}>
      {/* Main Glass Card */}
      <div
        className={`w-full h-full rounded-2xl border p-3 sm:p-3.5 transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between ${cardBorderClass}`}
      >
        {/* Top Row: Medal + Avatar & Username + Solved Score */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Medal */}
            <PodiumMedal rank={rank} />

            {/* Avatar Initial */}
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-extrabold text-xs sm:text-sm border shrink-0 shadow-xs ${avatarBgClass}`}
            >
              {(user.username || 'U').charAt(0).toUpperCase()}
            </div>

            {/* Username & Level */}
            <div className="min-w-0">
              <h3 className="font-bold text-[var(--text-primary)] text-xs sm:text-sm truncate leading-tight">
                {user.username || 'Anonymous'}
              </h3>
              {showLevel && (
                <div className="mt-0.5">
                  <span className="inline-flex items-center rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[8px] sm:text-[9px] font-bold text-amber-700 dark:text-amber-300">
                    Lv. {user.level}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Solved Score */}
          <div className="text-right shrink-0">
            <p className="font-mono text-sm sm:text-base font-black text-[var(--text-primary)] leading-none">
              {user.solvedCount}{' '}
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">QS</span>
            </p>
            <p className="text-[8px] sm:text-[9px] font-semibold text-[var(--text-muted)] mt-0.5 uppercase tracking-wide">
              {periodLabel}
            </p>
          </div>
        </div>

        {/* Bottom Sub-stats Row - Compact single line */}
        <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-1 text-center">
          <div className="rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] py-1 px-1 flex items-center justify-center gap-1">
            <Flame size={11} className="text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400 shrink-0" />
            <div className="text-left leading-tight">
              <span className="font-mono font-bold text-[var(--text-primary)] text-xs block">{user.maxStreak}</span>
              <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-tight block">Streak</span>
            </div>
          </div>

          <div className="rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] py-1 px-1 flex items-center justify-center gap-1">
            <Target size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-left leading-tight">
              <span className="font-mono font-bold text-[var(--text-primary)] text-xs block">{user.totalSolved}</span>
              <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-tight block">Total</span>
            </div>
          </div>

          <div className="rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] py-1 px-1 flex items-center justify-center gap-1">
            <Calendar size={11} className="text-sky-600 dark:text-sky-400 shrink-0" />
            <div className="text-left leading-tight">
              <span className="font-mono font-bold text-[var(--text-primary)] text-xs block">{user.solvedThisWeek}</span>
              <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-tight block">Week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeaderboardPage: React.FC = () => {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Load stored user on mount
  useEffect(() => {
    const user = getStoredUser();
    if (user?.username) {
      setCurrentUser(user.username);
    }
  }, []);

  const settings = data?.settings || DEFAULT_LEADERBOARD_SETTINGS;
  const isEnabled = data?.isEnabled !== false;
  const podiumUsers = data?.podium || [];
  const tableUsers = data?.users || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 15, pages: 1 };
  const pageSize = settings?.rowsPerPage || 15;

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const token = getStoredToken();
      const headers: Record<string, string> = {};
      if (token) headers['x-auth-token'] = token;

      const params = new URLSearchParams({
        period,
        page: String(page),
        limit: String(pageSize),
      });
      if (search.trim()) params.set('search', search.trim());
      if (currentUser) params.set('username', currentUser);

      const targetUrl = apiUrl(`/api/auth/leaderboard?${params.toString()}`);
      const res = await fetch(targetUrl, { headers });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const raw = await res.json();
      const normalized = normalizeLeaderboardResponse(raw, period);
      setData(normalized);
    } catch (error: any) {
      console.error('Failed to fetch leaderboard:', error);
      setFetchError(error?.message || 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  }, [period, page, search, currentUser, pageSize]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Handle period change
  const handlePeriodChange = (newPeriod: 'all' | 'weekly' | 'monthly') => {
    setPeriod(newPeriod);
    setPage(1);
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // Filter table users by search query
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return tableUsers;
    const q = search.trim().toLowerCase();
    return tableUsers.filter(
      (u) =>
        (u.username || '').toLowerCase().includes(q) ||
        String(u.rank).includes(q)
    );
  }, [tableUsers, search]);

  // If server already returned paginated slice, display as-is
  const isServerPaginated = Boolean(data?.isServerPaginated && tableUsers.length <= pageSize);

  const effectiveTotal = search.trim()
    ? (isServerPaginated ? pagination.total : filteredUsers.length)
    : (pagination.total || filteredUsers.length);

  const effectivePages = isServerPaginated
    ? Math.max(1, pagination.pages || 1)
    : Math.max(1, Math.ceil(effectiveTotal / pageSize));

  // Ensure current page does not exceed effectivePages
  useEffect(() => {
    if (page > effectivePages && effectivePages > 0) {
      setPage(effectivePages);
    }
  }, [page, effectivePages]);

  const displayTableUsers = useMemo(() => {
    // If backend returned all users in a single payload (legacy backend), paginate on client.
    if (!isServerPaginated && filteredUsers.length > pageSize) {
      const start = (page - 1) * pageSize;
      return filteredUsers.slice(start, start + pageSize);
    }
    // Server already returned current page's slice
    return filteredUsers;
  }, [filteredUsers, isServerPaginated, page, pageSize]);

  // Reorder podium into: 2nd place (left), 1st place (center), 3rd place (right)
  const orderedPodium = useMemo(() => {
    if (podiumUsers.length === 0) return [];
    const first = podiumUsers.find((u) => u.rank === 1) || podiumUsers[0];
    const second = podiumUsers.find((u) => u.rank === 2) || (podiumUsers.length > 1 ? podiumUsers[1] : null);
    const third = podiumUsers.find((u) => u.rank === 3) || (podiumUsers.length > 2 ? podiumUsers[2] : null);

    const list: Array<{ user: LeaderboardUser; rank: number }> = [];
    if (second) list.push({ user: second, rank: 2 });
    if (first) list.push({ user: first, rank: 1 });
    if (third) list.push({ user: third, rank: 3 });
    return list;
  }, [podiumUsers]);

  // Highest solve count in table for proportional progress bars
  const maxSolvedInView = useMemo(() => {
    if (displayTableUsers.length === 0) return 1;
    return Math.max(...displayTableUsers.map((u) => u.solvedCount), 1);
  }, [displayTableUsers]);

  const periodLabel = period === 'weekly' ? 'This Week' : period === 'monthly' ? 'This Month' : 'All Time';

  return (
    <div className="page-shell min-h-screen">
      <AnimatedBackground />

      <main className="page-wrap py-5 sm:py-6 space-y-4 sm:space-y-5">
        {/* Fetch Error Banner / Alert */}
        {fetchError && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-700 dark:text-red-200">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <AlertCircle size={16} className="text-red-500 dark:text-red-400 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchLeaderboard()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/20 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-200 hover:bg-red-500/30 transition shrink-0"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Retry
            </button>
          </div>
        )}

        {/* If leaderboard is disabled by admin */}
        {!isEnabled ? (
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1210] p-10 text-center space-y-3">
            <Trophy size={36} className="mx-auto text-amber-500/60" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Leaderboard Temporarily Unavailable</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              The community leaderboard is currently undergoing scheduled updates. Please check back shortly!
            </p>
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* TOP 3 PODIUM SECTION - Compact & Centered */}
            {/* ========================================================= */}
            {settings?.isPodiumEnabled !== false && orderedPodium.length > 0 && (
              <section className="pt-1 flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full max-w-[840px] items-stretch">
                  {orderedPodium.map(({ user, rank }) => (
                    <PodiumCard
                      key={user.username}
                      user={user}
                      rank={rank}
                      periodLabel={periodLabel}
                      showLevel={settings?.showLevelBadge !== false}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================= */}
            {/* CONTROLS: FILTERS & USERNAME SEARCH */}
            {/* ========================================================= */}
            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              {/* Segmented Filter Pills */}
              <div className="inline-flex items-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-muted)] p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => handlePeriodChange('all')}
                  className={`rounded-lg px-3.5 py-1 text-xs font-bold transition-all ${
                    period === 'all'
                      ? 'border border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-xs)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  All Time
                </button>

                {settings?.showWeeklyFilter !== false && (
                  <button
                    type="button"
                    onClick={() => handlePeriodChange('weekly')}
                    className={`rounded-lg px-3.5 py-1 text-xs font-bold transition-all ${
                      period === 'weekly'
                        ? 'border border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-xs)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    This Week
                  </button>
                )}

                {settings?.showMonthlyFilter !== false && (
                  <button
                    type="button"
                    onClick={() => handlePeriodChange('monthly')}
                    className={`rounded-lg px-3.5 py-1 text-xs font-bold transition-all ${
                      period === 'monthly'
                        ? 'border border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-xs)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    This Month
                  </button>
                )}
              </div>

              {/* Right: Search Box + Total Learners Count */}
              <div className="flex items-center gap-3">
                {settings?.isSearchEnabled !== false && (
                  <div className="relative w-full sm:w-64">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search by username..."
                      className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] py-1.5 pl-8 pr-7 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition focus:border-[var(--text-primary)] focus:ring-1 focus:ring-[var(--text-primary)]"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => handleSearchChange('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                )}

                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Total
                  </span>
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                    {effectiveTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* LEADERBOARD TABLE - Compact Rows & Clean View */}
            {/* ========================================================= */}
            <section className="overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] relative">
              {loading ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
                </div>
              ) : displayTableUsers.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Trophy size={28} className="mx-auto text-[var(--text-muted)]" />
                  <p className="font-bold text-[var(--text-primary)]">No learners found</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {search ? `No results matching "${search}"` : 'Be the first to solve a problem!'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    {/* Table Header */}
                    <thead className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      <tr>
                        <th className="py-2.5 pl-4 pr-2 w-14 text-center">#</th>
                        <th className="py-2.5 px-3">User</th>
                        {settings?.showLevelBadge !== false && (
                          <th className="py-2.5 px-3 text-center w-20">Level</th>
                        )}
                        <th className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1">
                            Solved <ArrowUpDown size={11} className="text-[var(--text-muted)]" />
                          </span>
                        </th>
                        {settings?.showStreakColumn !== false && (
                          <th className="py-2.5 px-3 hidden sm:table-cell">Max Streak</th>
                        )}
                        {settings?.showThisWeekColumn !== false && (
                          <th className="py-2.5 px-3 hidden md:table-cell">This Week</th>
                        )}
                        {settings?.showLastSolvedColumn !== false && (
                          <th className="py-2.5 px-3 hidden lg:table-cell">Last Solved</th>
                        )}
                        <th className="py-2.5 pr-4 pl-2 w-8"></th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {displayTableUsers.map((user) => {
                        const isCurrent =
                          currentUser && user.username && user.username.toLowerCase() === currentUser.toLowerCase();

                        // Progress percentage relative to top solver in view
                        const progressPercent = Math.max(
                          6,
                          Math.min(100, Math.round((user.solvedCount / maxSolvedInView) * 100))
                        );

                        return (
                          <tr
                            key={user.username || user.rank}
                            className={`group transition-colors ${
                              isCurrent
                                ? 'bg-amber-500/[0.08] hover:bg-amber-500/[0.12] border-y border-amber-500/30'
                                : 'hover:bg-[var(--bg-surface-hover)]'
                            }`}
                          >
                            {/* Rank Column */}
                            <td className="py-2.5 pl-4 pr-2 text-center font-bold">
                              {user.rank === 1 ? (
                                <div className="inline-flex items-center justify-center gap-1 text-amber-500 dark:text-amber-400">
                                  <Crown size={13} className="fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
                                  <span className="font-mono text-xs font-black">1</span>
                                </div>
                              ) : user.rank === 2 ? (
                                <div className="inline-flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300">
                                  <Medal size={13} className="fill-slate-400 dark:fill-slate-300 text-slate-600 dark:text-slate-300" />
                                  <span className="font-mono text-xs font-black">2</span>
                                </div>
                              ) : user.rank === 3 ? (
                                <div className="inline-flex items-center justify-center gap-1 text-amber-700 dark:text-amber-600">
                                  <Medal size={13} className="fill-amber-600 dark:fill-amber-600 text-amber-700 dark:text-amber-600" />
                                  <span className="font-mono text-xs font-black">3</span>
                                </div>
                              ) : (
                                <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">
                                  #{user.rank}
                                </span>
                              )}
                            </td>

                            {/* User Column */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                    user.rank === 1
                                      ? 'bg-amber-100 text-amber-950 font-black'
                                      : user.rank === 2
                                      ? 'bg-slate-200 text-slate-900 font-black'
                                      : user.rank === 3
                                      ? 'bg-amber-100 text-amber-900 font-black'
                                      : 'bg-[var(--bg-surface-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                                  }`}
                                >
                                  {(user.username || 'U').charAt(0).toUpperCase()}
                                </div>

                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className={`font-semibold text-xs sm:text-sm truncate ${
                                      isCurrent ? 'text-amber-600 dark:text-amber-300' : 'text-[var(--text-primary)]'
                                    }`}
                                  >
                                    {user.username || 'Anonymous'}
                                  </span>

                                  {isCurrent && (
                                    <span className="rounded border border-amber-500/40 bg-amber-500/20 px-1 py-0.2 text-[8px] font-black uppercase text-amber-700 dark:text-amber-300">
                                      YOU
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Level Column */}
                            {settings?.showLevelBadge !== false && (
                              <td className="py-2.5 px-3 text-center">
                                <span className="inline-flex items-center rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                                  Lv. {user.level}
                                </span>
                              </td>
                            )}

                            {/* Solved Count + Mini Progress Bar */}
                            <td className="py-2.5 px-3">
                              <div className="space-y-0.5">
                                <span className="font-mono text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                                  {user.solvedCount}
                                </span>
                                <div className="w-16 sm:w-20 h-1 rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Max Streak Column */}
                            {settings?.showStreakColumn !== false && (
                              <td className="py-2.5 px-3 hidden sm:table-cell">
                                <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                                  <Flame size={13} className="text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400 shrink-0" />
                                  <span className="font-mono font-bold text-xs text-[var(--text-primary)]">{user.maxStreak}</span>
                                </div>
                              </td>
                            )}

                            {/* This Week Column */}
                            {settings?.showThisWeekColumn !== false && (
                              <td className="py-2.5 px-3 hidden md:table-cell">
                                <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                                  <BarChart2 size={13} className="text-sky-500 dark:text-sky-400 shrink-0" />
                                  <span className="font-mono font-bold text-xs text-[var(--text-primary)]">
                                    {user.solvedThisWeek}
                                  </span>
                                </div>
                              </td>
                            )}

                            {/* Last Solved Column */}
                            {settings?.showLastSolvedColumn !== false && (
                              <td className="py-2.5 px-3 hidden lg:table-cell text-[var(--text-muted)] text-xs">
                                {formatRelativeTime(user.lastSolvedAt)}
                              </td>
                            )}

                            {/* Arrow Action */}
                            <td className="py-2.5 pr-4 pl-2 text-right">
                              <ChevronRight
                                size={14}
                                className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Footer with Pagination */}
              {effectivePages > 1 && (
                <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-4 py-2.5 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span>
                    Showing {displayTableUsers.length} of {effectiveTotal.toLocaleString()} learners
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-1 text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <span className="font-mono text-xs text-[var(--text-primary)] px-2">
                      {page} / {effectivePages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= effectivePages}
                      onClick={() => setPage((p) => Math.min(effectivePages, p + 1))}
                      className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-1 text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LeaderboardPage;
