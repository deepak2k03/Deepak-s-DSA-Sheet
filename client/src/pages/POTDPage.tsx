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
  Sparkles,
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
}

const difficultyBadges: Record<string, string> = {
  Easy: "text-emerald-700 bg-emerald-100 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-800/60",
  Medium: "text-amber-700 bg-amber-100 border-amber-300 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-800/60",
  Hard: "text-rose-700 bg-rose-100 border-rose-300 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-800/60",
};

const difficultyTextColors: Record<string, string> = {
  Easy: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-rose-600 dark:text-rose-400",
};

const POTDHeaderIllustration: React.FC = () => (
  <div className="relative hidden lg:block w-[170px] h-[135px] shrink-0 select-none pointer-events-none">
    {/* Ambient Glow */}
    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full transform -translate-y-1 translate-x-2" />

    {/* Main Code Window */}
    <div className="relative w-[138px] h-[112px] rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0c1210]/95 backdrop-blur-md shadow-xl dark:shadow-2xl p-2.5 transform rotate-[-4deg]">
      {/* Window Controls */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600/80" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600/80" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600/80" />
      </div>

      {/* Code icon */}
      <div className="flex items-center justify-center h-[50px] text-emerald-600 dark:text-emerald-400">
        <Code2 size={34} className="drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
      </div>

      {/* Code skeleton lines */}
      <div className="space-y-1 mt-0.5 px-1">
        <div className="h-1 w-14 bg-slate-200 dark:bg-white/10 rounded-full" />
        <div className="h-1 w-8 bg-slate-200 dark:bg-white/10 rounded-full" />
      </div>
    </div>

    {/* Floating Calendar Widget */}
    <div className="absolute -bottom-1 -right-1 w-[58px] h-[54px] rounded-xl border border-emerald-500/30 bg-emerald-50/95 dark:bg-[#091410]/95 backdrop-blur-md shadow-xl p-1.5 transform rotate-[5deg] flex flex-col items-center justify-center">
      <Calendar size={22} className="text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.45)]" />
    </div>
  </div>
);

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

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10">
          {/* Left Title and Subtitle */}
          <div className="flex-1 max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Daily practice</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              One meaningful problem,
              <br />
              <span className="text-emerald-600 dark:text-emerald-400">every day.</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Small daily wins compound into genuine fluency.
              <br />
              Here’s today’s focused challenge.
            </p>
          </div>

          {/* Right Header Controls: Countdown Box + 3D Illustration */}
          <div className="flex items-center gap-5 shrink-0 self-start lg:self-center">
            {/* Countdown Box */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0d1210] p-4 sm:p-5 shadow-lg min-w-[210px]">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  REFRESHES IN
                </span>
              </div>

              <p className="mt-2 font-mono text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
                {timeLeft || "08h : 29m : 19s"}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5">
                <Calendar size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="truncate">A new problem arrives every day</span>
              </div>
            </div>

            {/* 3D Coding Graphic */}
            <POTDHeaderIllustration />
          </div>
        </header>

        {/* Content Body: Problem Card */}
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c100e]">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : problem ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090d0b] p-6 sm:p-8 shadow-xl dark:shadow-2xl relative">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_270px] gap-8 items-stretch">
              {/* Left Column: Problem Details */}
              <div className="flex flex-col justify-between">
                <div>
                  {/* Badges Row */}
                  <div className="mb-6 flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex items-center justify-center rounded-lg border px-3 py-1 text-xs font-semibold ${
                        difficultyBadges[problem.difficulty] || difficultyBadges.Easy
                      }`}
                    >
                      {problem.difficulty}
                    </span>

                    <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <Calendar size={13} className="text-slate-500 dark:text-slate-400" />
                      {getFormattedDate(problem.potdDate)}
                    </span>

                    <span className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] px-3 py-1 text-xs font-semibold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
                      {formatTopicBadge(problem.focusArea || problem.topic)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                    {problem.title}
                  </h2>

                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
                    {problem.description ||
                      "Set aside a focused block, understand the pattern, then solve it cleanly. The aim is durable thinking—not just another checkmark."}
                  </p>
                </div>

                {/* Horizontal Divider & Left Buttons */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.06] flex flex-wrap gap-2.5">
                  <a
                    href={tutorial(problem)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white transition"
                  >
                    <Play size={13} className="fill-current text-slate-800 dark:text-white" />
                    <span>Tutorial</span>
                  </a>

                  <a
                    href={`/problem/${problem.id}/solution`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white transition"
                  >
                    <Code2 size={15} className="text-slate-800 dark:text-white" />
                    <span>Code</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Metadata Sidebar + Solve Button */}
              <div className="border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  {/* Focus Area */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                      <Target size={19} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        FOCUS AREA
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {problem.focusArea || formatTopicName(problem.topic)}
                      </p>
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                      <BarChart2 size={19} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        DIFFICULTY
                      </p>
                      <p
                        className={`text-sm font-bold mt-0.5 ${
                          difficultyTextColors[problem.difficulty] || "text-emerald-500"
                        }`}
                      >
                        {problem.difficulty}
                      </p>
                    </div>
                  </div>

                  {/* Estimated Time */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                      <FileText size={19} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        ESTIMATED TIME
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {problem.estimatedTime || getEstimatedTime(problem.difficulty)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Solve Button */}
                <div className="pt-2">
                  <a
                    href={problem.link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-black font-bold text-xs sm:text-sm py-2.5 px-4 shadow-sm transition"
                  >
                    <span>Solve on platform</span>
                    <ExternalLink size={14} className="text-white dark:text-black" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c100e]">
            <p className="font-semibold text-slate-500">No problem of the day found.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default POTDPage;
