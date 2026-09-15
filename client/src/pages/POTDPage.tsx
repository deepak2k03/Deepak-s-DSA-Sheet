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
  videoSolutionUrl?: string;
}

const difficulty: Record<string, string> = {
  Easy: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-900/30', 
  Medium: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-900/30', 
  Hard: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-900/30' 
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
      setTimeLeft(
        `${String(Math.floor(seconds / 3600)).padStart(2, "0")}h : ${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}m : ${String(seconds % 60).padStart(2, "0")}s`,
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const tutorial = (item: Problem) =>
    item.videoSolutionUrl || item.tutorialLink || `https://www.google.com/search?q=${encodeURIComponent(`${item.title} tutorial`)}`;

  return (
    <div className="page-shell">
      <AnimatedBackground />
      <main className="page-wrap max-w-4xl py-10 sm:py-14">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--border-subtle)] pb-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
              <Sparkles size={14} className="text-[var(--text-primary)]" />
              <span>Daily practice</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
              One meaningful problem, <span className="text-[var(--text-muted)]">every day.</span>
            </h1>
            <p className="mt-4 text-lg text-[var(--text-secondary)]">
              Small daily wins compound into genuine fluency. Here’s today’s focused challenge.
            </p>
          </div>
          
          <div className="flex min-w-[200px] items-center gap-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-sm)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-surface-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Refreshes in</p>
              <p className="mt-0.5 font-mono text-lg font-bold text-[var(--text-primary)] tabular-nums">{timeLeft}</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="mt-8 flex min-h-[300px] items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/50">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--text-muted)]" />
          </div>
        ) : problem ? (
          <section className="mt-10 overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-sm)] sm:p-12 relative">
            
            <div className="relative z-10">
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-semibold ${difficulty[problem.difficulty]}`}>
                  {problem.difficulty}
                </span>
                <span className="flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                  <Calendar size={14} />
                  {new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                </span>
                <span className="rounded-md border border-[var(--border-strong)] bg-[var(--bg-base)] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {problem.topic}
                </span>
              </div>
              
              <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                {problem.title}
              </h2>
              
              <p className="mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
                Set aside a focused block, understand the pattern, then solve it cleanly. The aim is durable thinking—not just another checkmark.
              </p>
              
              <div className="mt-10 flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-4">
                  <a
                    href={tutorial(problem)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface-muted)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-hover)] hover:border-[var(--text-primary)]"
                  >
                    <Youtube size={16} /> Tutorial
                  </a>
                  <a
                    href={`/problem/${problem.id}/solution`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface-muted)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-hover)] hover:border-[var(--text-primary)]"
                  >
                    <Code2 size={16} /> Code
                  </a>
                </div>
                <a
                  href={problem.link}
                  target="_blank"
                  rel="noreferrer"
                  className="button-primary"
                >
                  Solve on platform <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </section>
        ) : (
          <div className="mt-8 flex min-h-[300px] items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/50">
            <p className="font-semibold text-[var(--text-muted)]">No problem of the day found.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default POTDPage;
