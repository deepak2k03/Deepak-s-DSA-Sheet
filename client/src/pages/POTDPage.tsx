import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Code2,
  ExternalLink,
  Loader2,
  Sparkles,
  Youtube,
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
  tutorialLink?: string;
  solutionLink?: string;
  codeLink?: string;
}
const difficulty: Record<string, string> = {
  Easy: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  Medium: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
  Hard: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
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
      const seconds = Math.max(
        0,
        Math.floor((tomorrow.getTime() - now.getTime()) / 1000),
      );
      setTimeLeft(
        `${String(Math.floor(seconds / 3600)).padStart(2, "0")}h : ${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}m : ${String(seconds % 60).padStart(2, "0")}s`,
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);
  const tutorial = (item: Problem) =>
    item.tutorialLink ||
    `https://www.google.com/search?q=${encodeURIComponent(`${item.title} tutorial`)}`;
  return (
    <div className="page-shell">
      <AnimatedBackground />
      <main className="page-wrap max-w-5xl py-10 sm:py-14">
        <header className="grid gap-8 border-b border-slate-200/80 pb-10 dark:border-white/10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow mb-4">
              <Sparkles size={14} /> Daily practice
            </p>
            <h1 className="text-4xl font-extrabold tracking-[-.045em] text-[#102b27] sm:text-5xl dark:text-white">
              One meaningful problem,{" "}
              <span className="text-teal-700 dark:text-teal-300">
                every day.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-400">
              Small daily wins compound into genuine fluency. Here’s today’s
              focused challenge.
            </p>
          </div>
          <div className="surface flex items-center gap-4 rounded-2xl px-5 py-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#dceee9] text-[#123b36] dark:bg-teal-400/10 dark:text-teal-300">
              <Clock size={19} />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400">
                Refreshes in
              </p>
              <p className="font-mono mt-1 text-lg font-medium tabular-nums">
                {timeLeft}
              </p>
            </div>
          </div>
        </header>
        {loading ? (
          <div className="surface mt-8 grid min-h-[330px] place-items-center rounded-[28px]">
            <Loader2 className="animate-spin text-teal-600 dark:text-teal-300" />
          </div>
        ) : problem ? (
          <section className="surface relative mt-8 overflow-hidden rounded-[28px] p-7 sm:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-100/70 blur-3xl dark:bg-teal-400/5" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${difficulty[problem.difficulty]}`}
                >
                  {problem.difficulty}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Calendar size={14} />
                  {new Date().toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-8 text-xs font-extrabold uppercase tracking-[.16em] text-teal-700 dark:text-teal-300">
                {problem.topic}
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-[-.035em] sm:text-4xl">
                {problem.title}
              </h2>
              <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
                Set aside a focused block, understand the pattern, then solve it
                cleanly. The aim is durable thinking—not just another checkmark.
              </p>
              <div className="mt-9 flex flex-col gap-3 border-t border-slate-100 pt-7 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                <div className="flex flex-wrap gap-4">
                  <a
                    href={tutorial(problem)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    <Youtube size={17} /> Tutorial
                  </a>
                  {problem.codeLink && (
                    <a
                      href={problem.codeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-teal-700 dark:hover:text-teal-300"
                    >
                      <Code2 size={17} /> Code
                    </a>
                  )}
                </div>
                <a
                  href={problem.link}
                  target="_blank"
                  rel="noreferrer"
                  className="button-primary"
                >
                  Solve challenge <ExternalLink size={17} />
                </a>
              </div>
            </div>
          </section>
        ) : (
          <div className="surface mt-8 rounded-2xl py-20 text-center text-slate-500">
            Today’s challenge is unavailable. Please check back shortly.
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
export default POTDPage;
