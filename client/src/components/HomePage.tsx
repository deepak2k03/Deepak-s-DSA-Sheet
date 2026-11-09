import React, { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, BookOpen, Flame, Heart, Layers, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../config';
import { defaultTopics } from '../data/topics';
import { fetchPublicTopics } from '../utils/topicApi';
import AnimatedBackground from './AnimatedBackground';
import DSAConquestAnimation from './DSAConquestAnimation';
import Footer from './Footer';

const TargetIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-emerald-400' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="2" />
    <path d="M19 5L15 9" />
    <path d="M15 5h4v4" />
  </svg>
);

const AscendingBarsIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-emerald-400' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="6" y1="18" x2="6" y2="13" />
    <line x1="12" y1="18" x2="12" y2="8.5" />
    <line x1="18" y1="18" x2="18" y2="4" />
  </svg>
);

const HomePage: React.FC = () => {
  const [stats, setStats] = useState({ totalProblems: 0, activeUsers: 0, topicsCount: 0, totalSolves: 0 });
  
  useEffect(() => {
    const load = async () => { 
      try {
        const [problems, users, topics] = await Promise.all([
          fetch(apiUrl('/api/problems/all')), 
          fetch(apiUrl('/api/auth/leaderboard')), 
          fetchPublicTopics().catch(() => defaultTopics)
        ]);
        const problemData = await problems.json(); 
        const userData = await users.json();
        const userList = Array.isArray(userData) ? userData : (userData?.users || []);
        const activeUsersCount = userData?.summary?.totalLearners ?? userList.length;
        const totalSolvesCount = userData?.summary?.totalSolved ?? userList.reduce((sum: number, user: { solvedCount?: number }) => sum + (user.solvedCount || 0), 0);
        setStats({ 
          totalProblems: Array.isArray(problemData) ? problemData.length : 0, 
          activeUsers: activeUsersCount, 
          topicsCount: topics.length, 
          totalSolves: totalSolvesCount, 
        });
      } catch { 
        setStats({ totalProblems: 450, activeUsers: 0, topicsCount: defaultTopics.length, totalSolves: 0 }); 
      } 
    };
    load();
  }, []);

  return (
    <div className="page-shell overflow-x-hidden">
      <AnimatedBackground />
      <main>
        {/* HERO SECTION */}
        <section className="page-wrap relative grid items-center gap-8 lg:gap-6 xl:gap-8 pt-2 sm:pt-4 lg:pt-3 pb-20 sm:pb-24 lg:pb-16 lg:grid-cols-[0.78fr_1.42fr] xl:grid-cols-[0.74fr_1.46fr] overflow-hidden lg:overflow-visible">
          
          {/* Left Column (Content) */}
          <div className="relative z-20 flex flex-col items-center lg:items-start text-center lg:text-left pt-2 sm:pt-4 lg:pt-5 xl:pt-6 pl-0 sm:pl-2 lg:pl-6 xl:pl-8 2xl:pl-10 pointer-events-auto w-full max-w-full">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.15] tracking-tight text-[var(--text-primary)] break-words max-w-full text-center lg:text-left">
              Practice with direction. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                Improve with intent.
              </span>
            </h1>
            
            <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed text-justify lg:text-left">
              500+ hand-picked problems organized by patterns, difficulty, and topic. Stop jumping between random problems. Follow a structured path from fundamentals to interview-ready.
            </p>
            
            <div className="mt-6 sm:mt-8 lg:mt-10 grid grid-cols-2 gap-2.5 sm:gap-3 w-full max-w-md lg:max-w-none lg:flex lg:flex-nowrap lg:w-max mx-auto lg:mx-0">
              <Link to="/topics" className="button-primary group justify-center text-center whitespace-nowrap shrink-0 !px-3.5 !py-2.5 text-xs sm:text-sm md:text-base">
                Explore roadmap 
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/potd" className="button-secondary group justify-center text-center whitespace-nowrap shrink-0 !px-3.5 !py-2.5 text-xs sm:text-sm md:text-base">
                <Flame size={16} className="text-orange-500 transition-transform group-hover:scale-110" /> 
                Today's challenge
              </Link>
              <Link to="/support" className="col-span-2 lg:col-span-1 button-secondary group border-dashed justify-center text-center whitespace-nowrap shrink-0 !px-3.5 !py-2.5 hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-800 dark:hover:text-rose-400 transition-colors text-xs sm:text-sm md:text-base">
                <Heart size={16} className="text-rose-500 transition-transform group-hover:scale-110" /> 
                Support the creator
              </Link>
            </div>
            
            <div className="mt-6 sm:mt-8 lg:mt-12 flex items-center justify-center lg:justify-start gap-3 sm:gap-6 flex-wrap w-full">
              <div className="flex -space-x-2.5 sm:-space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-[var(--bg-base)] bg-[var(--bg-surface-muted)] flex items-center justify-center text-[10px] sm:text-xs font-bold text-[var(--text-secondary)]">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                Join <span className="font-bold text-[var(--text-primary)]">{stats.activeUsers || '400+'}</span> active learners today
              </p>
            </div>
          </div>
          
          {/* Right Column (Visual) */}
          <div className="relative z-10 w-full lg:translate-x-5 xl:translate-x-8 2xl:translate-x-10 mt-6 sm:mt-8 lg:mt-0 flex flex-col items-center">
             <div className="absolute inset-4 bg-gradient-to-tr from-emerald-500/15 to-teal-500/10 blur-2xl opacity-30 dark:opacity-15 rounded-[40px] z-0 pointer-events-none"></div>
             
             <div className="relative z-10 w-full flex items-center justify-center overflow-visible">
                <DSAConquestAnimation />
             </div>

             {/* Feature highlight badges below animation */}
             <div className="w-full flex items-center justify-center z-20 mt-3 sm:mt-4 lg:mt-5 px-2">
               <div className="grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 max-w-full">
                 {/* Card 1: 500+ Problems */}
                 <div className="flex items-center gap-3 sm:gap-3.5 px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-2xl border border-[var(--border-subtle)] dark:border-emerald-500/20 bg-[var(--bg-surface)]/90 dark:bg-black/60 backdrop-blur-md shadow-sm hover:border-emerald-500/50 hover:bg-[var(--bg-surface-hover)] transition-all">
                   <Layers size={24} className="text-emerald-400 shrink-0 stroke-[2.2]" />
                   <div className="text-left min-w-0">
                     <p className="font-extrabold text-sm sm:text-base text-[var(--text-primary)] leading-tight tracking-tight whitespace-nowrap">
                       500+
                     </p>
                     <p className="text-xs sm:text-sm text-[var(--text-secondary)] dark:text-zinc-400 leading-tight mt-0.5 whitespace-nowrap">
                       Problems
                     </p>
                   </div>
                 </div>

                 {/* Card 2: 20+ Topics */}
                 <div className="flex items-center gap-3 sm:gap-3.5 px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-2xl border border-[var(--border-subtle)] dark:border-emerald-500/20 bg-[var(--bg-surface)]/90 dark:bg-black/60 backdrop-blur-md shadow-sm hover:border-emerald-500/50 hover:bg-[var(--bg-surface-hover)] transition-all">
                   <Layers size={24} className="text-emerald-400 shrink-0 stroke-[2.2]" />
                   <div className="text-left min-w-0">
                     <p className="font-extrabold text-sm sm:text-base text-[var(--text-primary)] leading-tight tracking-tight whitespace-nowrap">
                       20+
                     </p>
                     <p className="text-xs sm:text-sm text-[var(--text-secondary)] dark:text-zinc-400 leading-tight mt-0.5 whitespace-nowrap">
                       Topics
                     </p>
                   </div>
                 </div>

                 {/* Card 3: Pattern-based Learning */}
                 <div className="flex items-center gap-3 sm:gap-3.5 px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-2xl border border-[var(--border-subtle)] dark:border-emerald-500/20 bg-[var(--bg-surface)]/90 dark:bg-black/60 backdrop-blur-md shadow-sm hover:border-emerald-500/50 hover:bg-[var(--bg-surface-hover)] transition-all">
                   <TargetIcon className="w-6 h-6 text-emerald-400 shrink-0 stroke-[2.2]" />
                   <div className="text-left min-w-0">
                     <p className="font-extrabold text-sm sm:text-base text-[var(--text-primary)] leading-tight tracking-tight whitespace-nowrap">
                       Pattern-based
                     </p>
                     <p className="text-xs sm:text-sm text-[var(--text-secondary)] dark:text-zinc-400 leading-tight mt-0.5 whitespace-nowrap">
                       Learning
                     </p>
                   </div>
                 </div>

                 {/* Card 4: Progress Tracking */}
                 <div className="flex items-center gap-3 sm:gap-3.5 px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-2xl border border-[var(--border-subtle)] dark:border-emerald-500/20 bg-[var(--bg-surface)]/90 dark:bg-black/60 backdrop-blur-md shadow-sm hover:border-emerald-500/50 hover:bg-[var(--bg-surface-hover)] transition-all">
                   <AscendingBarsIcon className="w-6 h-6 text-emerald-400 shrink-0 stroke-[2.4]" />
                   <div className="text-left min-w-0">
                     <p className="font-extrabold text-sm sm:text-base text-[var(--text-primary)] leading-tight tracking-tight whitespace-nowrap">
                       Progress
                     </p>
                     <p className="text-xs sm:text-sm text-[var(--text-secondary)] dark:text-zinc-400 leading-tight mt-0.5 whitespace-nowrap">
                       Tracking
                     </p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
          
        </section>

        {/* STATS SECTION */}
        <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/50">
          <div className="page-wrap grid grid-cols-2 divide-x divide-[var(--border-subtle)] md:grid-cols-4">
            {[
              [stats.totalProblems, 'Curated problems'],
              [stats.topicsCount, 'Learning tracks'],
              [stats.totalSolves, 'Problems solved'],
              [stats.activeUsers, 'Active learners']
            ].map(([value, label]) => (
              <div key={String(label)} className="px-5 py-12 text-center group">
                <p className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] transition-transform group-hover:scale-105">{value}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="page-wrap py-24 lg:py-32">
          <div className="flex max-w-3xl flex-col gap-4 mx-auto text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Everything meaningful stays within reach.
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              No busy dashboards. Just a clear system for learning patterns and maintaining momentum.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {([
              [BookOpen, 'Structured roadmap', 'Move through the concepts in an order that makes sense.'],
              [BarChart3, 'Progress you can feel', 'See solved work, topic depth, and daily consistency at a glance.'],
              [Trophy, 'Friendly competition', 'Find motivation on the leaderboard without losing focus.']
            ] as const).map(([Icon, title, copy]) => {
              const I = Icon as typeof BookOpen;
              return (
                <article key={String(title)} className="group flex flex-col rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-[var(--border-strong)]">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-surface-muted)] border border-[var(--border-default)] text-[var(--text-primary)] transition-colors group-hover:bg-[var(--text-primary)] group-hover:text-[var(--text-inverted)]">
                    <I size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{copy}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
