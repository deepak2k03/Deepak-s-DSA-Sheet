import React, { useEffect, useState } from "react";
import {
  BarChart2,
  Calendar,
  Clock,
  Code2,
  ExternalLink,
  FileText,
  Loader2,
  Play,
  PlayCircle,
  Target,
} from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import Footer from "../components/Footer";
import { apiUrl } from "../config";

interface Problem {
  id: number;
  title: string;
  link: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  description?: string;
  estimatedTime?: string;
  focusArea?: string;
  potdDate?: string;
  tutorialLink?: string;
  solutionLink?: string;
  githubLink?: string;
  videoSolutionUrl?: string;
  visualizerSlug?: string;
}

const difficultyBadges: Record<string, string> = {
  Easy: "text-emerald-700 bg-emerald-500/15 border-emerald-500/30 dark:text-emerald-400",
  Medium: "text-amber-700 bg-amber-500/15 border-amber-500/30 dark:text-amber-400",
  Hard: "text-rose-700 bg-rose-500/15 border-rose-500/30 dark:text-rose-400",
};

const difficultyTextColors: Record<string, string> = {
  Easy: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-rose-600 dark:text-rose-400",
};

const POTDPage: React.FC = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    fetch(apiUrl("/api/problems/potd"))
      .then((res) => res.json())
      .then(setProblem)
      .catch((error) => console.error("Failed to fetch POTD", error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const seconds = Math.max(0, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
      const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const secs = String(seconds % 60).padStart(2, "0");
      setTimeLeft(`${hours}h : ${minutes}m : ${secs}s`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const tutorial = (item: Problem) =>
    item.videoSolutionUrl ||
    item.tutorialLink ||
    `https://www.google.com/search?q=${encodeURIComponent(`${item.title} tutorial`)}`;

  const getFormattedDate = (dateStr?: string) => {
    let now = new Date();
    if (dateStr) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        now = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        now = new Date(dateStr);
      }
    }
    const day = now.getDate();
    const month = now.toLocaleString("en-US", { month: "long" });
    const year = now.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTopicBadge = (topic?: string) => {
    if (!topic) return "GENERAL";
    return topic.trim().toUpperCase().replace(/\s+/g, "-");
  };

  const formatTopicName = (topic?: string) => {
    if (!topic) return "General Problem Solving";
    return topic
      .split(/[-_ ]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getEstimatedTime = (diff?: "Easy" | "Medium" | "Hard") => {
    if (diff === "Hard") return "45–60 minutes";
    if (diff === "Medium") return "20–30 minutes";
    return "10–15 minutes";
  };

  return (
    <div className="page-shell min-h-screen">
      <AnimatedBackground />

      <main className="page-wrap max-w-6xl mx-auto py-10 sm:py-14">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10">
          {/* Left Title and Subtitle */}
          <div className="flex-1 max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15]">
              One meaningful
              <br />
              problem,{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                every day.
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              Small daily wins compound into genuine fluency.
              <br />
              Here’s today’s focused challenge.
            </p>
          </div>

          {/* Right Header: Sleek Unified Countdown Card */}
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-emerald-950/20 dark:bg-[#061410]/90 backdrop-blur-md p-5 sm:p-6 shadow-[var(--shadow-sm)] flex items-center justify-between gap-5 sm:gap-8 min-w-[320px] sm:min-w-[420px] shrink-0 self-start lg:self-center">
            {/* Subtle Ambient Radial Glow */}
            <div className="pointer-events-none absolute -right-6 -bottom-6 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl" />

            {/* Left: Timer details */}
            <div className="relative z-10 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-500 dark:text-emerald-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  REFRESHES IN
                </span>
              </div>

              <p className="my-2 sm:my-2.5 font-mono text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-wide">
                {timeLeft || "03h : 56m : 09s"}
              </p>

              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Calendar size={13} className="shrink-0" />
                <span>A new problem arrives every day</span>
              </div>
            </div>

            {/* Right: Calendar Square Badge */}
            <div className="relative z-10 flex h-20 w-20 sm:h-22 sm:w-22 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shadow-inner">
              <Calendar size={38} strokeWidth={1.8} className="drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" />
            </div>
          </div>
        </header>

        {/* Content Body: Problem Card */}
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)]">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : problem ? (
          <section className="overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 sm:p-8 lg:p-9 shadow-[var(--shadow-sm)] relative">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] xl:grid-cols-[1fr_310px] gap-8 xl:gap-10 items-stretch">
              {/* Left Column: Problem Details & Action Buttons */}
              <div className="flex flex-col justify-between gap-6">
                <div>
                  {/* Badges Row */}
                  <div className="mb-4 sm:mb-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <span
                      className={`inline-flex items-center justify-center rounded-xl border px-3.5 py-1.5 text-xs font-bold ${
                        difficultyBadges[problem.difficulty] || difficultyBadges.Easy
                      }`}
                    >
                      {problem.difficulty}
                    </span>

                    <span className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                      <Calendar size={13} className="text-[var(--text-muted)]" />
                      {getFormattedDate(problem.potdDate)}
                    </span>

                    <span className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3.5 py-1.5 text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase">
                      {formatTopicBadge(problem.focusArea || problem.topic)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3">
                    {problem.title}
                  </h2>

                  {/* Description */}
                  <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-xl">
                    {problem.description ||
                      "Set aside a focused block, understand the pattern, then solve it cleanly. The aim is durable thinking—not just another checkmark."}
                  </p>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-3.5">
                  <a
                    href={tutorial(problem)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-5 py-3 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] shadow-[var(--shadow-xs)] transition-all group active:scale-[0.98]"
                  >
                    <Play size={14} className="fill-current transition-transform group-hover:scale-110" />
                    <span>Tutorial</span>
                  </a>

                  <a
                    href={`/problem/${problem.id}/solution`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-5 py-3 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] shadow-[var(--shadow-xs)] transition-all group active:scale-[0.98]"
                  >
                    <Code2 size={16} className="transition-transform group-hover:scale-110" />
                    <span>Code</span>
                  </a>

                  <a
                    href={problem.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 px-6 py-3 text-sm font-extrabold shadow-sm transition-all group active:scale-[0.98]"
                  >
                    <span>Solve on platform</span>
                    <ExternalLink size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </a>

                  {problem.visualizerSlug && (
                    <a
                      href={`/visualizers/${problem.visualizerSlug}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all shadow-[var(--shadow-xs)]"
                    >
                      <PlayCircle size={16} className="text-amber-500 animate-pulse" />
                      <span>Interactive Visualizer</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: 3 Stacked Metadata Cards */}
              <div className="flex flex-col justify-center gap-3.5 sm:gap-4">
                {/* Focus Area */}
                <div className="flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3.5 sm:p-4 transition-colors">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow-[var(--shadow-xs)]">
                    <Target size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      FOCUS AREA
                    </p>
                    <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-0.5 truncate">
                      {problem.focusArea || formatTopicName(problem.topic)}
                    </p>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3.5 sm:p-4 transition-colors">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow-[var(--shadow-xs)]">
                    <BarChart2 size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      DIFFICULTY
                    </p>
                    <p
                      className={`text-sm sm:text-base font-bold mt-0.5 ${
                        difficultyTextColors[problem.difficulty] || "text-emerald-500"
                      }`}
                    >
                      {problem.difficulty}
                    </p>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3.5 sm:p-4 transition-colors">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow-[var(--shadow-xs)]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      ESTIMATED TIME
                    </p>
                    <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-0.5">
                      {problem.estimatedTime || getEstimatedTime(problem.difficulty)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)]">
            <p className="font-semibold text-[var(--text-muted)]">No problem of the day found.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default POTDPage;
