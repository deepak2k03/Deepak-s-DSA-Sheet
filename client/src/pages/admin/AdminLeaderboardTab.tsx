import React from 'react';
import {
  Trophy,
  RefreshCw,
  Eye,
  ExternalLink,
  LayoutDashboard,
  Shield,
  Loader2,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { ToggleRow, Select, Input } from './AdminUIPrimitives';

export interface LeaderboardConfigState {
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
  cacheDurationSeconds: number;
}

interface AdminLeaderboardTabProps {
  leaderboardConfig: LeaderboardConfigState;
  setLeaderboardConfig: React.Dispatch<React.SetStateAction<LeaderboardConfigState>>;
  saveLeaderboardSettings: (e: React.FormEvent) => void;
  savingLeaderboard: boolean;
  handleRefreshLeaderboardCache: () => void;
  refreshingLeaderboard: boolean;
  leaderboardLastCache: string | null;
  leaderboardSummary?: {
    totalLearners: number;
    totalSolved: number;
    topStreak: number;
    lastUpdated?: string;
  } | null;
}

export const AdminLeaderboardTab: React.FC<AdminLeaderboardTabProps> = ({
  leaderboardConfig,
  setLeaderboardConfig,
  saveLeaderboardSettings,
  savingLeaderboard,
  handleRefreshLeaderboardCache,
  refreshingLeaderboard,
  leaderboardLastCache,
  leaderboardSummary,
}) => {
  return (
    <section className="space-y-6">
      {/* Header with Title & Quick Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Trophy className="text-amber-500" size={24} />
            Leaderboard Control &amp; Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage platform-wide leaderboard visibility, podium display, column metrics, deterministic ranking rules, and cache performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefreshLeaderboardCache}
            disabled={refreshingLeaderboard}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#101614] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition shadow-sm disabled:opacity-60"
          >
            <RefreshCw size={14} className={refreshingLeaderboard ? 'animate-spin' : ''} />
            <span>{refreshingLeaderboard ? 'Recalculating...' : 'Force Refresh Cache'}</span>
          </button>
          <a
            href="/leaderboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#101614] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition shadow-sm"
          >
            <Eye size={15} />
            <span>View Public Leaderboard</span>
            <ExternalLink size={13} className="text-slate-400" />
          </a>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] items-start">
        {/* Left Column: Settings Configuration Forms */}
        <div className="space-y-6">
          {/* 1. Display Settings */}
          <div className="surface rounded-3xl p-6 space-y-5">
            <div className="border-b border-slate-100 dark:border-white/10 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LayoutDashboard size={18} className="text-teal-500" />
                Display &amp; Visibility Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toggle student-facing sections, filters, podium, and table columns.
              </p>
            </div>

            <div className="space-y-3.5">
              <ToggleRow
                label="Enable Community Leaderboard Page"
                checked={leaderboardConfig.isLeaderboardEnabled}
                onChange={(checked) =>
                  setLeaderboardConfig((c) => ({ ...c, isLeaderboardEnabled: checked }))
                }
              />

              <ToggleRow
                label="Show Top-3 Podium Showcase"
                checked={leaderboardConfig.isPodiumEnabled}
                onChange={(checked) =>
                  setLeaderboardConfig((c) => ({ ...c, isPodiumEnabled: checked }))
                }
              />

              <ToggleRow
                label="Show Summary Statistics Header Cards"
                checked={leaderboardConfig.isSummaryStatsEnabled}
                onChange={(checked) =>
                  setLeaderboardConfig((c) => ({ ...c, isSummaryStatsEnabled: checked }))
                }
              />

              {leaderboardConfig.isSummaryStatsEnabled && (
                <div className="ml-4 pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-2.5 pt-1">
                  <ToggleRow
                    label="Show Active Learners Count"
                    checked={leaderboardConfig.showStatActiveLearners}
                    onChange={(checked) =>
                      setLeaderboardConfig((c) => ({ ...c, showStatActiveLearners: checked }))
                    }
                  />
                  <ToggleRow
                    label="Show Total Problems Solved"
                    checked={leaderboardConfig.showStatTotalSolved}
                    onChange={(checked) =>
                      setLeaderboardConfig((c) => ({ ...c, showStatTotalSolved: checked }))
                    }
                  />
                  <ToggleRow
                    label="Show Day Streak (Top)"
                    checked={leaderboardConfig.showStatTopStreak}
                    onChange={(checked) =>
                      setLeaderboardConfig((c) => ({ ...c, showStatTopStreak: checked }))
                    }
                  />
                  <ToggleRow
                    label="Show Last Updated Timestamp"
                    checked={leaderboardConfig.showStatLastUpdated}
                    onChange={(checked) =>
                      setLeaderboardConfig((c) => ({ ...c, showStatLastUpdated: checked }))
                    }
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-3">
                <ToggleRow
                  label="Show 'This Week' Filter Tab"
                  checked={leaderboardConfig.showWeeklyFilter}
                  onChange={(checked) =>
                    setLeaderboardConfig((c) => ({ ...c, showWeeklyFilter: checked }))
                  }
                />

                <ToggleRow
                  label="Show 'This Month' Filter Tab"
                  checked={leaderboardConfig.showMonthlyFilter}
                  onChange={(checked) =>
                    setLeaderboardConfig((c) => ({ ...c, showMonthlyFilter: checked }))
                  }
                />

                <ToggleRow
                  label="Show Student Level Badges (Rank Matrix)"
                  checked={leaderboardConfig.showLevelBadge}
                  onChange={(checked) =>
                    setLeaderboardConfig((c) => ({ ...c, showLevelBadge: checked }))
                  }
                />

                <ToggleRow
                  label="Show Consecutive Streak Column"
                  checked={leaderboardConfig.showStreakColumn}
                  onChange={(checked) =>
                    setLeaderboardConfig((c) => ({ ...c, showStreakColumn: checked }))
                  }
                />

                <ToggleRow
                  label="Show Solved-This-Week Column"
                  checked={leaderboardConfig.showThisWeekColumn}
                  onChange={(checked) =>
                    setLeaderboardConfig((c) => ({ ...c, showThisWeekColumn: checked }))
                  }
                />

                <ToggleRow
                  label="Show Last Solved Timestamp Column"
                  checked={leaderboardConfig.showLastSolvedColumn}
                  onChange={(checked) =>
                    setLeaderboardConfig((c) => ({ ...c, showLastSolvedColumn: checked }))
                  }
                />

                <ToggleRow
                  label="Enable Instant Learner Search Box"
                  checked={leaderboardConfig.isSearchEnabled}
                  onChange={(checked) =>
                    setLeaderboardConfig((c) => ({ ...c, isSearchEnabled: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* 2. Ranking & Tie-Breaker Logic */}
          <div className="surface rounded-3xl p-6 space-y-5">
            <div className="border-b border-slate-100 dark:border-white/10 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield size={18} className="text-teal-500" />
                Ranking Rules &amp; Tie-Breakers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Deterministic rules applied when multiple learners have solved the same number of questions.
              </p>
            </div>

            <div className="space-y-4">
              <Select
                label="Tie-Breaker Rule"
                value={leaderboardConfig.tieBreaker}
                onChange={(v) =>
                  setLeaderboardConfig((c) => ({
                    ...c,
                    tieBreaker: v as 'earliest_solve' | 'account_age' | 'alphabetical',
                  }))
                }
                options={[
                  {
                    value: 'earliest_solve',
                    label: 'Earliest Solve Time (Fairness standard)',
                    description: 'Learners who reached their solved count first rank higher',
                  },
                  {
                    value: 'account_age',
                    label: 'Senior Account Age',
                    description: 'Older registered accounts break the tie',
                  },
                  {
                    value: 'alphabetical',
                    label: 'Alphabetical Order',
                    description: 'Username A to Z breaks the tie',
                  },
                ]}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Default Active Tab"
                  value={leaderboardConfig.defaultPeriod}
                  onChange={(v) =>
                    setLeaderboardConfig((c) => ({
                      ...c,
                      defaultPeriod: v as 'all' | 'weekly' | 'monthly',
                    }))
                  }
                  options={[
                    { value: 'all', label: 'All-Time Solves' },
                    { value: 'weekly', label: 'This Week Only' },
                    { value: 'monthly', label: 'This Month Only' },
                  ]}
                />

                <Select
                  label="Rows Per Page"
                  value={String(leaderboardConfig.rowsPerPage)}
                  onChange={(v) =>
                    setLeaderboardConfig((c) => ({ ...c, rowsPerPage: Number(v) || 15 }))
                  }
                  options={[
                    { value: '10', label: '10 Rows' },
                    { value: '15', label: '15 Rows (Standard)' },
                    { value: '25', label: '25 Rows' },
                    { value: '50', label: '50 Rows' },
                  ]}
                />
              </div>

              <ToggleRow
                label="Include Inactive Accounts with 0 Solves"
                checked={leaderboardConfig.showZeroSolves}
                onChange={(checked) =>
                  setLeaderboardConfig((c) => ({ ...c, showZeroSolves: checked }))
                }
              />
            </div>
          </div>

          {/* 3. Cache Management */}
          <div className="surface rounded-3xl p-6 space-y-4">
            <div className="border-b border-slate-100 dark:border-white/10 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw size={18} className="text-teal-500" />
                Performance &amp; Cache Lifetime
              </h2>
            </div>

            <div className="space-y-4">
              <Input
                label="In-Memory Cache TTL (seconds)"
                type="number"
                value={String(leaderboardConfig.cacheDurationSeconds)}
                onChange={(v) =>
                  setLeaderboardConfig((c) => ({ ...c, cacheDurationSeconds: Math.max(5, Number(v) || 30) }))
                }
                helperText="Controls how long processed leaderboard ranks are kept in memory before recalculation (minimum 5s, recommended 30s)."
              />
            </div>
          </div>

          {/* Save Settings Trigger */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={saveLeaderboardSettings}
              disabled={savingLeaderboard}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#123b36] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-teal-900/10 transition hover:bg-[#0b2d29] disabled:opacity-60 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300"
            >
              {savingLeaderboard ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{savingLeaderboard ? 'Saving Settings...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Status & Operational Summary */}
        <div className="space-y-6">
          {/* Summary Mini-Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 bg-slate-50 dark:bg-white/[0.02]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Solvers
              </p>
              <p className="mt-1 font-mono text-xl font-black text-slate-900 dark:text-white">
                {leaderboardSummary?.totalLearners ?? '—'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 bg-slate-50 dark:bg-white/[0.02]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Solves
              </p>
              <p className="mt-1 font-mono text-xl font-black text-slate-900 dark:text-white">
                {leaderboardSummary?.totalSolved ?? '—'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 bg-slate-50 dark:bg-white/[0.02]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Top Day Streak
              </p>
              <p className="mt-1 font-mono text-xl font-black text-amber-500">
                {leaderboardSummary?.topStreak ?? '—'} days
              </p>
            </div>
          </div>

          <div className="surface rounded-3xl p-6 space-y-4 border border-teal-500/20 bg-teal-500/[0.02]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <CheckCircle2 size={18} className="text-teal-500" />
              Leaderboard Operational Status
            </h3>
            <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
              <p className="flex items-center justify-between">
                <span>Leaderboard:</span>
                <span
                  className={`font-semibold ${
                    leaderboardConfig.isLeaderboardEnabled ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {leaderboardConfig.isLeaderboardEnabled ? 'Publicly Live' : 'Disabled (Hidden)'}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span>Podium:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {leaderboardConfig.isPodiumEnabled ? 'Visible (Top 3)' : 'Hidden'}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span>Cache State:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {leaderboardLastCache ? new Date(leaderboardLastCache).toLocaleTimeString() : 'Fresh'}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span>Active Tie-Breaker:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 capitalize">
                  {leaderboardConfig.tieBreaker.replace('_', ' ')}
                </span>
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleRefreshLeaderboardCache}
                disabled={refreshingLeaderboard}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-bold py-2.5 px-4 transition disabled:opacity-60"
              >
                <RefreshCw size={13} className={refreshingLeaderboard ? 'animate-spin' : ''} />
                <span>{refreshingLeaderboard ? 'Recalculating...' : 'Force Refresh Cache Now'}</span>
              </button>
            </div>
          </div>

          {/* Configuration Impact Guide */}
          <div className="surface rounded-3xl p-6 text-xs text-slate-500 dark:text-slate-400 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Shield size={16} className="text-teal-500" />
              Administrative Guardrails
            </h3>
            <ul className="space-y-2 list-disc pl-4 text-[11px] leading-relaxed">
              <li>
                <strong>Derived Integrity:</strong> Scores and streaks are derived from actual solve histories in MongoDB.
              </li>
              <li>
                <strong>Dynamic Tie-Breakers:</strong> The selected tie-breaker rule applies deterministically across both the podium and table.
              </li>
              <li>
                <strong>Real-Time Sync:</strong> Saving settings automatically invalidates the leaderboard cache so changes propagate to users instantly.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
