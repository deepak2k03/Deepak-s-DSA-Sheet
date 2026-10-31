import React from 'react';

export interface OverviewData {
  stats: {
    users: number;
    activeUsers: number;
    admins: number;
    problems: number;
    topics: number;
    visualizers?: number;
    totalSolved: number;
  };
  potd: {
    problemId?: string;
    problemNumber: number;
    title: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    topic?: string;
    link?: string;
    tutorialLink?: string;
    customDescription?: string;
    customEstimatedTime?: string;
    customFocusArea?: string;
    date: string;
  } | null;
  trends?: {
    newUsersByDay?: Array<{ date: string; value: number }>;
    solvesByDay?: Array<{ date: string; value: number }>;
    topTopics?: Array<{ slug: string; name: string; solves: number }>;
  } | null;
}

interface AdminOverviewTabProps {
  overview: OverviewData | null;
  onNavigateToPOTD: () => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  overview,
  onNavigateToPOTD,
}) => {
  if (!overview) {
    return (
      <div className="surface rounded-3xl p-8 text-center text-slate-500">
        <p className="text-base font-medium">Unable to load overview metrics.</p>
        <p className="mt-1 text-xs text-slate-400">
          Please check your connection or click &ldquo;Refresh data&rdquo; above.
        </p>
      </div>
    );
  }

  return (
    <section className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6">
      {[
        ['Users', overview.stats.users],
        ['Active Users', overview.stats.activeUsers],
        ['Admins', overview.stats.admins],
        ['Problems', overview.stats.problems],
        ['Topics', overview.stats.topics],
        ['Total Solves', overview.stats.totalSolved],
      ].map(([label, value]) => (
        <div key={label} className="surface rounded-3xl p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      ))}

      <div className="surface rounded-3xl p-6 sm:col-span-2 md:col-span-3 2xl:col-span-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Today&apos;s POTD</p>
        {overview.potd ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                #{overview.potd.problemNumber} {overview.potd.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Scheduled for {new Date(overview.potd.date).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onNavigateToPOTD}
              className="rounded-xl bg-[#123b36] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b2d29] dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300"
            >
              Change POTD
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No problem is pinned for today yet.</p>
        )}
      </div>

      {overview.trends && (
        <div className="surface rounded-3xl p-6 sm:col-span-2 md:col-span-3 2xl:col-span-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">New Users (7d)</p>
              <div className="mt-3 flex items-end gap-1">
                {(overview.trends.newUsersByDay || []).map((item) => (
                  <div
                    key={item.date}
                    className="flex-1 rounded-t bg-teal-500/80"
                    style={{ height: `${Math.max(item.value * 12, 6)}px` }}
                    title={`${item.date}: ${item.value}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Solves (7d)</p>
              <div className="mt-3 flex items-end gap-1">
                {(overview.trends.solvesByDay || []).map((item) => (
                  <div
                    key={item.date}
                    className="flex-1 rounded-t bg-emerald-500/80"
                    style={{ height: `${Math.max(item.value * 8, 6)}px` }}
                    title={`${item.date}: ${item.value}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Top Solved Topics</p>
              <div className="mt-3 space-y-2 text-sm">
                {(overview.trends.topTopics || []).length > 0 ? (
                  (overview.trends.topTopics || []).map((topic) => (
                    <div
                      key={topic.slug}
                      className="flex items-center justify-between rounded-lg bg-[#dceee9]/50 px-3 py-1.5 dark:bg-teal-400/5"
                    >
                      <span className="text-slate-700 dark:text-slate-200">{topic.name}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{topic.solves}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">No solve trend data yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
