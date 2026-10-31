import React from 'react';
import {
  BarChart2,
  Calendar,
  Code2,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Play,
  Save,
  Sparkles,
  Target,
} from 'lucide-react';
import { Input, TextArea, Select } from './AdminUIPrimitives';
import type { AdminProblem } from './AdminProblemsTab';

export interface AdminPOTDTabProps {
  potdScheduledDate: string;
  setPotdScheduledDate: (date: string) => void;
  selectedPotdProblemId: string;
  setSelectedPotdProblemId: (id: string) => void;
  potdProblemOptions: Array<{ label: string; value: string; hint?: string }>;
  selectedPotdProblem: AdminProblem | undefined;
  potdCustomFocusArea: string;
  setPotdCustomFocusArea: (val: string) => void;
  potdCustomEstimatedTime: string;
  setPotdCustomEstimatedTime: (val: string) => void;
  potdCustomDescription: string;
  setPotdCustomDescription: (val: string) => void;
  assignPotd: () => void;
  saving: boolean;
  overview: {
    potd?: {
      problemId: number;
      problemNumber: number;
      title: string;
      difficulty: string;
      topic: string;
      date: string;
      customDescription?: string;
      customEstimatedTime?: string;
      customFocusArea?: string;
    };
  } | null;
}

export const AdminPOTDTab: React.FC<AdminPOTDTabProps> = ({
  potdScheduledDate,
  setPotdScheduledDate,
  selectedPotdProblemId,
  setSelectedPotdProblemId,
  potdProblemOptions,
  selectedPotdProblem,
  potdCustomFocusArea,
  setPotdCustomFocusArea,
  potdCustomEstimatedTime,
  setPotdCustomEstimatedTime,
  potdCustomDescription,
  setPotdCustomDescription,
  assignPotd,
  saving,
  overview,
}) => {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="text-emerald-500" size={24} />
            Problem of the Day Control Center
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select the featured problem, customize challenge guidance, override focus area tags, and schedule dates with live preview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/potd"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#101614] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition shadow-sm"
          >
            <Eye size={15} />
            <span>View Public POTD</span>
            <ExternalLink size={13} className="text-slate-400" />
          </a>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)] items-start">
        {/* Left Column: Form Controls */}
        <div className="surface rounded-3xl p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-white/10 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">POTD Configuration</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure every student-facing element of the daily challenge card.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Scheduled Date (YYYY-MM-DD)"
              type="date"
              value={potdScheduledDate}
              onChange={setPotdScheduledDate}
              required
              helperText="Which calendar day this POTD is active for."
            />

            <Select
              label="Featured Sheet Problem"
              value={selectedPotdProblemId}
              onChange={setSelectedPotdProblemId}
              options={potdProblemOptions}
              searchable={true}
              searchPlaceholder="Search all problems by name, topic..."
              required
              helperText={
                selectedPotdProblem
                  ? `Selected: #${(selectedPotdProblem as any).problemNumber || selectedPotdProblem.id} ${selectedPotdProblem.title} (${selectedPotdProblem.difficulty})`
                  : 'Pick a problem from the entire DSA sheet.'
              }
            />

            <Input
              label="Custom Focus Area Title (Optional Override)"
              value={potdCustomFocusArea}
              onChange={setPotdCustomFocusArea}
              placeholder={
                selectedPotdProblem
                  ? `Default: ${selectedPotdProblem.topic}`
                  : 'e.g., Dynamic Programming, Sliding Window'
              }
              helperText="Controls both the pill badge (e.g., DYNAMIC-PROGRAMMING) and the Focus Area card. Defaults to problem topic if empty."
            />

            <Input
              label="Custom Estimated Time (Optional Override)"
              value={potdCustomEstimatedTime}
              onChange={setPotdCustomEstimatedTime}
              placeholder={
                selectedPotdProblem
                  ? `Default: ${
                      selectedPotdProblem.difficulty === 'Hard'
                        ? '45–60 minutes'
                        : selectedPotdProblem.difficulty === 'Medium'
                        ? '20–30 minutes'
                        : '10–15 minutes'
                    }`
                  : 'e.g., 25–35 minutes'
              }
              helperText="Controls the Estimated Time stat card. Defaults to auto-calculation based on difficulty if empty."
            />

            <TextArea
              label="Custom Challenge Guidance / Description (Optional)"
              value={potdCustomDescription}
              onChange={setPotdCustomDescription}
              rows={3}
              placeholder="Set aside a focused block, understand the pattern, then solve it cleanly. The aim is durable thinking—not just another checkmark."
              helperText="Custom motivation, hints, or instructions displayed prominently under the title. Defaults to standard quote if empty."
            />

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={assignPotd}
                disabled={saving || !selectedPotdProblemId}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#123b36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0b2d29] disabled:opacity-60 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save &amp; Set POTD
              </button>

              {(potdCustomDescription || potdCustomEstimatedTime || potdCustomFocusArea) && (
                <button
                  type="button"
                  onClick={() => {
                    setPotdCustomDescription('');
                    setPotdCustomEstimatedTime('');
                    setPotdCustomFocusArea('');
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                >
                  Reset Overrides
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Card Preview Matching /potd */}
        <div className="space-y-6">
          <div className="surface rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye size={18} className="text-teal-500" />
                  Live Student Card Preview
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time visualization of what students see on /potd
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Sparkles size={12} />
                Live Preview
              </span>
            </div>

            {/* Card mockup */}
            <div className="rounded-2xl border border-white/10 bg-[#090d0b] p-6 text-white shadow-2xl relative">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6 items-stretch">
                {/* Left: badges + title + description */}
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${
                          selectedPotdProblem?.difficulty === 'Hard'
                            ? 'text-rose-400 bg-rose-950/50 border-rose-800/60'
                            : selectedPotdProblem?.difficulty === 'Medium'
                            ? 'text-amber-400 bg-amber-950/50 border-amber-800/60'
                            : 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60'
                        }`}
                      >
                        {selectedPotdProblem?.difficulty || 'Medium'}
                      </span>

                      <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-slate-300">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(potdScheduledDate + 'T00:00:00').toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>

                      <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                        {(potdCustomFocusArea || selectedPotdProblem?.topic || 'GENERAL')
                          .trim()
                          .toUpperCase()
                          .replace(/\s+/g, '-')}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2">
                      {selectedPotdProblem
                        ? `#${(selectedPotdProblem as any).problemNumber || selectedPotdProblem.id} ${selectedPotdProblem.title}`
                        : 'Select a problem from the dropdown'}
                    </h3>

                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {potdCustomDescription ||
                        'Set aside a focused block, understand the pattern, then solve it cleanly. The aim is durable thinking—not just another checkmark.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white pointer-events-none"
                    >
                      <Play size={11} className="fill-current text-white" />
                      <span>Tutorial</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white pointer-events-none"
                    >
                      <Code2 size={13} className="text-white" />
                      <span>Code</span>
                    </button>
                  </div>
                </div>

                {/* Right: metadata sidebar */}
                <div className="border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between gap-4">
                  <div className="space-y-4">
                    {/* Focus Area */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
                        <Target size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          FOCUS AREA
                        </p>
                        <p className="text-xs font-bold text-white mt-0.5">
                          {potdCustomFocusArea || selectedPotdProblem?.topic || 'General Practice'}
                        </p>
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
                        <BarChart2 size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          DIFFICULTY
                        </p>
                        <p
                          className={`text-xs font-bold mt-0.5 ${
                            selectedPotdProblem?.difficulty === 'Hard'
                              ? 'text-rose-400'
                              : selectedPotdProblem?.difficulty === 'Medium'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {selectedPotdProblem?.difficulty || 'Medium'}
                        </p>
                      </div>
                    </div>

                    {/* Estimated Time */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          ESTIMATED TIME
                        </p>
                        <p className="text-xs font-bold text-white mt-0.5">
                          {potdCustomEstimatedTime ||
                            (selectedPotdProblem?.difficulty === 'Hard'
                              ? '45–60 minutes'
                              : selectedPotdProblem?.difficulty === 'Medium'
                              ? '20–30 minutes'
                              : '10–15 minutes')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white text-black font-bold text-xs py-2 px-3 shadow-sm pointer-events-none">
                      <span>Solve on platform</span>
                      <ExternalLink size={12} className="text-black" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Database Pinned Status */}
          {overview?.potd && (
            <div className="surface rounded-3xl p-6 border border-emerald-500/20 bg-emerald-500/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    Active Database Record
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    #{overview.potd.problemNumber} {overview.potd.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Assigned for {overview.potd.date} • Topic: {overview.potd.topic || 'General'} • Difficulty: {overview.potd.difficulty || 'Medium'}
                  </p>
                  {overview.potd.customFocusArea && (
                    <p className="mt-1 text-xs text-teal-600 dark:text-teal-400">
                      Custom Focus Area: &ldquo;{overview.potd.customFocusArea}&rdquo;
                    </p>
                  )}
                  {overview.potd.customEstimatedTime && (
                    <p className="mt-0.5 text-xs text-teal-600 dark:text-teal-400">
                      Custom Estimated Time: &ldquo;{overview.potd.customEstimatedTime}&rdquo;
                    </p>
                  )}
                  {overview.potd.customDescription && (
                    <p className="mt-0.5 text-xs text-teal-600 dark:text-teal-400">
                      Custom Guidance: &ldquo;{overview.potd.customDescription}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

