import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Code2,
  Users,
  Calendar,
  Search,
  ChevronRight,
  ChevronLeft,
  Target,
  BarChart2,
  Sparkles,
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
  rowsPerPage: 25,
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
        limit: 25,
        pages: Math.max(1, Math.ceil(rawUsers.length / 25)),
      },
      settings: { ...DEFAULT_LEADERBOARD_SETTINGS, ...(raw.settings || {}) },
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
        limit: Math.max(25, users.length),
        pages: 1,
      },
      settings: DEFAULT_LEADERBOARD_SETTINGS,
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

function formatLastUpdated(dateStr?: string): string {
  if (!dateStr) return 'Live';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Live';
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
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

// Illuminated Pedestal underneath podium card
const PodiumPedestal: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) {
    return (
      <div className="relative w-full flex flex-col items-center mt-1 select-none pointer-events-none">
        <div className="w-24 h-3 bg-gradient-to-t from-amber-500/30 to-amber-500/5 rounded-t border-t-2 border-amber-400/60 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.35)]">
          <Crown size={10} className="text-amber-400/90 drop-shadow-[0_0_4px_rgba(245,158,11,0.8)]" />
        </div>
        <div className="w-32 h-1 bg-gradient-to-t from-amber-600/30 to-amber-500/20 rounded-t-sm border-t border-amber-400/40" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="relative w-full flex flex-col items-center mt-1 select-none pointer-events-none">
        <div className="w-20 h-2.5 bg-gradient-to-t from-slate-400/20 to-slate-400/5 rounded-t border-t-2 border-slate-300/40 flex items-center justify-center shadow-[0_0_10px_rgba(203,213,225,0.2)]">
          <Crown size={9} className="text-slate-300/80 drop-shadow-[0_0_4px_rgba(203,213,225,0.6)]" />
        </div>
        <div className="w-28 h-1 bg-gradient-to-t from-slate-500/25 to-slate-400/15 rounded-t-sm border-t border-slate-300/30" />
      </div>
    );
  }
  return (
    <div className="relative w-full flex flex-col items-center mt-1 select-none pointer-events-none">
      <div className="w-20 h-2.5 bg-gradient-to-t from-amber-700/25 to-amber-700/5 rounded-t border-t-2 border-amber-600/40 flex items-center justify-center shadow-[0_0_10px_rgba(180,83,9,0.2)]">
        <Crown size={9} className="text-amber-500/80 drop-shadow-[0_0_4px_rgba(180,83,9,0.6)]" />
      </div>
      <div className="w-28 h-1 bg-gradient-to-t from-amber-800/30 to-amber-700/15 rounded-t-sm border-t border-amber-600/30" />
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
      ? 'border-amber-400/50 bg-[#0d120f]/95 shadow-[0_0_25px_rgba(245,158,11,0.18)] ring-1 ring-amber-400/30'
      : rank === 2
      ? 'border-slate-500/40 bg-[#0c1012]/95 shadow-[0_0_18px_rgba(148,163,184,0.08)] ring-1 ring-slate-400/20'
      : 'border-amber-800/40 bg-[#120e0c]/95 shadow-[0_0_18px_rgba(180,83,9,0.08)] ring-1 ring-amber-700/20';

  const avatarBgClass =
    rank === 1
      ? 'bg-amber-50 text-slate-900 border-amber-300'
      : rank === 2
      ? 'bg-slate-100 text-slate-900 border-slate-300'
      : 'bg-amber-100/90 text-amber-950 border-amber-400';

  return (
    <div className={`flex flex-col items-center ${isFirst ? 'md:-translate-y-1' : ''}`}>
      {/* Main Glass Card */}
      <div
        className={`w-full rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 hover:scale-[1.01] ${cardBorderClass}`}
      >
        {/* Top Row: Medal + Avatar & Username + Solved Score */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Medal */}
            <PodiumMedal rank={rank} />

            {/* Avatar Initial */}
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-extrabold text-sm sm:text-base border shrink-0 shadow-sm ${avatarBgClass}`}
            >
              {(user.username || 'U').charAt(0).toUpperCase()}
            </div>

            {/* Username & Level */}
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm sm:text-base truncate leading-tight">
                {user.username || 'Anonymous'}
              </h3>
              {showLevel && (
                <div className="mt-0.5">
                  <span className="inline-flex items-center rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                    Lv. {user.level}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Solved Score */}
          <div className="text-right shrink-0">
            <p className="font-mono text-base sm:text-lg font-black text-white leading-none">
              {user.solvedCount}{' '}
              <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase">QS</span>
            </p>
            <p className="text-[9px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">
              {periodLabel}
            </p>
          </div>
        </div>

        {/* Bottom Sub-stats Row - Compact single line */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.08] grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] py-1 px-1.5 flex items-center justify-center gap-1.5">
            <Flame size={12} className="text-amber-400 fill-amber-400 shrink-0" />
            <div className="text-left leading-tight">
              <span className="font-mono font-bold text-white text-xs block">{user.maxStreak}</span>
              <span className="text-[8px] text-slate-400 uppercase tracking-tight block">Streak</span>
            </div>
          </div>

          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] py-1 px-1.5 flex items-center justify-center gap-1.5">
            <Target size={12} className="text-emerald-400 shrink-0" />
            <div className="text-left leading-tight">
              <span className="font-mono font-bold text-white text-xs block">{user.totalSolved}</span>
              <span className="text-[8px] text-slate-400 uppercase tracking-tight block">Total</span>
            </div>
          </div>

          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] py-1 px-1.5 flex items-center justify-center gap-1.5">
            <Calendar size={12} className="text-sky-400 shrink-0" />
            <div className="text-left leading-tight">
              <span className="font-mono font-bold text-white text-xs block">{user.solvedThisWeek}</span>
              <span className="text-[8px] text-slate-400 uppercase tracking-tight block">Week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Podium Pedestal Graphic */}
      <PodiumPedestal rank={rank} />
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
  }, [period, page, search, currentUser]);

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

  const settings = data?.settings || DEFAULT_LEADERBOARD_SETTINGS;
  const isEnabled = data?.isEnabled !== false;
  const summary = data?.summary;
  const podiumUsers = data?.podium || [];
  const tableUsers = data?.users || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 25, pages: 1 };

  // Filter table users by search query (works for both backend-filtered and legacy array payloads)
  const displayTableUsers = useMemo(() => {
    if (!search.trim()) return tableUsers;
    const q = search.trim().toLowerCase();
    return tableUsers.filter(
      (u) =>
        (u.username || '').toLowerCase().includes(q) ||
        String(u.rank).includes(q)
    );
  }, [tableUsers, search]);

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
    <div className="page-shell min-h-screen bg-[#070908] text-white">
      <AnimatedBackground />

      <main className="page-wrap py-5 sm:py-6 space-y-4 sm:space-y-5">
        {/* ========================================================= */}
        {/* HEADER SECTION & SUMMARY STATS - Compact & Full Width */}
        {/* ========================================================= */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0">
              <Trophy size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  Leaderboard
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  <Sparkles size={10} className="text-amber-400" /> Community
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                A live view of learners building consistency.
              </p>
            </div>
          </div>

          {/* Right: Summary Statistics Cards - Sleek & High Density */}
          {settings?.isSummaryStatsEnabled !== false && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 shrink-0">
              {/* Active Learners */}
              {settings?.showStatActiveLearners !== false && (
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0c1210]/90 px-3 py-1.5 shadow-sm min-w-[120px]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 shrink-0">
                    <Users size={14} />
                  </div>
                  <div>
                    <div className="font-mono text-sm sm:text-base font-black text-white leading-tight">
                      {(summary?.totalLearners ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Active
                    </div>
                  </div>
                </div>
              )}

              {/* Total Solved */}
              {settings?.showStatTotalSolved !== false && (
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0c1210]/90 px-3 py-1.5 shadow-sm min-w-[120px]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                    <Code2 size={14} />
                  </div>
                  <div>
                    <div className="font-mono text-sm sm:text-base font-black text-white leading-tight">
                      {(summary?.totalSolved ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Solved
                    </div>
                  </div>
                </div>
              )}

              {/* Day Streak Top */}
              {settings?.showStatTopStreak !== false && (
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0c1210]/90 px-3 py-1.5 shadow-sm min-w-[120px]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
                    <Flame size={14} className="fill-amber-400" />
                  </div>
                  <div>
                    <div className="font-mono text-sm sm:text-base font-black text-white leading-tight">
                      {summary?.topStreak ?? 0}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Top Streak
                    </div>
                  </div>
                </div>
              )}

              {/* Last Updated */}
              {settings?.showStatLastUpdated !== false && (
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0c1210]/90 px-3 py-1.5 shadow-sm min-w-[130px]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-slate-400 shrink-0">
                    <Calendar size={13} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Updated
                    </div>
                    <div className="font-mono text-[11px] font-semibold text-slate-200 truncate max-w-[100px]">
                      {formatLastUpdated(summary?.lastUpdated)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Fetch Error Banner / Alert */}
        {fetchError && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchLeaderboard()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/20 px-3 py-1 text-xs font-bold text-red-200 hover:bg-red-500/30 transition shrink-0"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Retry
            </button>
          </div>
        )}

        {/* If leaderboard is disabled by admin */}
        {!isEnabled ? (
          <div className="rounded-3xl border border-white/10 bg-[#0c1210] p-10 text-center space-y-3">
            <Trophy size={36} className="mx-auto text-amber-500/60" />
            <h2 className="text-xl font-bold text-white">Leaderboard Temporarily Unavailable</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              The community leaderboard is currently undergoing scheduled updates. Please check back shortly!
            </p>
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* TOP 3 PODIUM SECTION - Streamlined & Full Width */}
            {/* ========================================================= */}
            {settings?.isPodiumEnabled !== false && orderedPodium.length > 0 && (
              <section className="pt-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 items-end">
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
              <div className="inline-flex items-center rounded-xl border border-white/10 bg-[#0c100e] p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => handlePeriodChange('all')}
                  className={`rounded-lg px-3.5 py-1 text-xs font-bold transition-all ${
                    period === 'all'
                      ? 'bg-white/10 text-white shadow-sm border border-white/15'
                      : 'text-slate-400 hover:text-white'
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
                        ? 'bg-white/10 text-white shadow-sm border border-white/15'
                        : 'text-slate-400 hover:text-white'
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
                        ? 'bg-white/10 text-white shadow-sm border border-white/15'
                        : 'text-slate-400 hover:text-white'
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search by username..."
                      className="w-full rounded-xl border border-white/10 bg-[#0c100e] py-1.5 pl-8 pr-7 text-xs text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => handleSearchChange('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                )}

                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-[#0c100e] px-3 py-1.5 text-xs text-slate-400 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Total
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    {pagination.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* LEADERBOARD TABLE - Compact Rows & Clean View */}
            {/* ========================================================= */}
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#090d0b] shadow-xl relative">
              {loading ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
                </div>
              ) : displayTableUsers.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Trophy size={28} className="mx-auto text-slate-600" />
                  <p className="font-bold text-slate-400">No learners found</p>
                  <p className="text-xs text-slate-500">
                    {search ? `No results matching "${search}"` : 'Be the first to solve a problem!'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    {/* Table Header */}
                    <thead className="border-b border-white/10 bg-[#0c100e] text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="py-2.5 pl-4 pr-2 w-14 text-center">#</th>
                        <th className="py-2.5 px-3">User</th>
                        {settings?.showLevelBadge !== false && (
                          <th className="py-2.5 px-3 text-center w-20">Level</th>
                        )}
                        <th className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1">
                            Solved <ArrowUpDown size={11} className="text-slate-500" />
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
                    <tbody className="divide-y divide-white/[0.05]">
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
                                : 'hover:bg-white/[0.02]'
                            }`}
                          >
                            {/* Rank Column */}
                            <td className="py-2.5 pl-4 pr-2 text-center font-bold">
                              {user.rank === 1 ? (
                                <div className="inline-flex items-center justify-center gap-1 text-amber-400">
                                  <Crown size={13} className="fill-amber-400 text-amber-400" />
                                  <span className="font-mono text-xs font-black">1</span>
                                </div>
                              ) : user.rank === 2 ? (
                                <div className="inline-flex items-center justify-center gap-1 text-slate-300">
                                  <Medal size={13} className="fill-slate-300 text-slate-300" />
                                  <span className="font-mono text-xs font-black">2</span>
                                </div>
                              ) : user.rank === 3 ? (
                                <div className="inline-flex items-center justify-center gap-1 text-amber-600">
                                  <Medal size={13} className="fill-amber-600 text-amber-600" />
                                  <span className="font-mono text-xs font-black">3</span>
                                </div>
                              ) : (
                                <span className="font-mono text-xs font-semibold text-slate-500">
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
                                      ? 'bg-amber-200 text-amber-950 font-black'
                                      : user.rank === 2
                                      ? 'bg-slate-200 text-slate-950 font-black'
                                      : user.rank === 3
                                      ? 'bg-amber-700/50 text-amber-100 font-black'
                                      : 'bg-white/10 text-white'
                                  }`}
                                >
                                  {(user.username || 'U').charAt(0).toUpperCase()}
                                </div>

                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className={`font-semibold text-xs sm:text-sm truncate ${
                                      isCurrent ? 'text-amber-300' : 'text-white'
                                    }`}
                                  >
                                    {user.username || 'Anonymous'}
                                  </span>

                                  {isCurrent && (
                                    <span className="rounded border border-amber-500/40 bg-amber-500/20 px-1 py-0.2 text-[8px] font-black uppercase text-amber-300">
                                      YOU
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Level Column */}
                            {settings?.showLevelBadge !== false && (
                              <td className="py-2.5 px-3 text-center">
                                <span className="inline-flex items-center rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                                  Lv. {user.level}
                                </span>
                              </td>
                            )}

                            {/* Solved Count + Mini Progress Bar */}
                            <td className="py-2.5 px-3">
                              <div className="space-y-0.5">
                                <span className="font-mono text-xs sm:text-sm font-bold text-white">
                                  {user.solvedCount}
                                </span>
                                <div className="w-16 sm:w-20 h-1 rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Max Streak Column */}
                            {settings?.showStreakColumn !== false && (
                              <td className="py-2.5 px-3 hidden sm:table-cell">
                                <div className="flex items-center gap-1 text-slate-300">
                                  <Flame size={13} className="text-amber-400 fill-amber-400 shrink-0" />
                                  <span className="font-mono font-bold text-xs">{user.maxStreak}</span>
                                </div>
                              </td>
                            )}

                            {/* This Week Column */}
                            {settings?.showThisWeekColumn !== false && (
                              <td className="py-2.5 px-3 hidden md:table-cell">
                                <div className="flex items-center gap-1 text-slate-300">
                                  <BarChart2 size={13} className="text-sky-400 shrink-0" />
                                  <span className="font-mono font-bold text-xs">
                                    {user.solvedThisWeek}
                                  </span>
                                </div>
                              </td>
                            )}

                            {/* Last Solved Column */}
                            {settings?.showLastSolvedColumn !== false && (
                              <td className="py-2.5 px-3 hidden lg:table-cell text-slate-400 text-xs">
                                {formatRelativeTime(user.lastSolvedAt)}
                              </td>
                            )}

                            {/* Arrow Action */}
                            <td className="py-2.5 pr-4 pl-2 text-right">
                              <ChevronRight
                                size={14}
                                className="text-slate-600 group-hover:text-slate-300 transition-colors"
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
              {pagination.pages > 1 && (
                <div className="border-t border-white/10 bg-[#0c100e] px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Showing {displayTableUsers.length} of {pagination.total.toLocaleString()} learners
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-white/10 bg-white/[0.04] p-1 text-slate-300 hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <span className="font-mono text-xs text-white px-2">
                      {page} / {pagination.pages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= pagination.pages}
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      className="rounded-lg border border-white/10 bg-white/[0.04] p-1 text-slate-300 hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed transition"
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
