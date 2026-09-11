import React, { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, BookOpen, Flame, Heart, Sparkles, TrendingUp, Trophy, Code2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../config';
import { defaultTopics } from '../data/topics';
import { fetchPublicTopics } from '../utils/topicApi';
import AnimatedBackground from './AnimatedBackground';
import BinaryTreeAnimation from './BinaryTreeAnimation';
import Footer from './Footer';

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
        setStats({ 
          totalProblems: Array.isArray(problemData) ? problemData.length : 0, 
          activeUsers: Array.isArray(userData) ? userData.length : 0, 
          topicsCount: topics.length, 
          totalSolves: Array.isArray(userData) ? userData.reduce((sum: number, user: { solvedCount?: number }) => sum + (user.solvedCount || 0), 0) : 0 
        });
      } catch { 
        setStats({ totalProblems: 450, activeUsers: 0, topicsCount: defaultTopics.length, totalSolves: 0 }); 
      } 
    };
    load();
  }, []);

  return (
    <div className="page-shell overflow-hidden">
      <AnimatedBackground />
      <main>
        {/* HERO SECTION */}
        <section className="page-wrap relative grid min-h-[70vh] items-center gap-16 pt-8 pb-20 lg:grid-cols-[1fr_1fr] lg:pt-12 lg:pb-28">
          
          {/* Left Column (Content) */}
          <div className="relative z-10 flex flex-col items-start text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-xs)] transition-colors hover:border-[var(--text-primary)]">
              <Sparkles size={14} className="text-emerald-500 dark:text-emerald-400" />
              <span>A better way to practice DSA</span>
            </div>
            
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
              Practice with direction. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                Improve with intent.
              </span>
            </h1>
            
            <p className="mt-6 max-w-xl text-lg text-[var(--text-secondary)] leading-relaxed">
              A thoughtfully curated DSA roadmap that helps you recognize patterns, build momentum, and see every bit of progress. No busy dashboards, just code.
            </p>
            
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/topics" className="button-primary group">
                Explore roadmap 
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/potd" className="button-secondary group">
                <Flame size={16} className="text-orange-500 transition-transform group-hover:scale-110" /> 
                Today's challenge
              </Link>
              <Link to="/support" className="button-secondary group border-dashed hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-800 dark:hover:text-rose-400 transition-colors">
                <Heart size={16} className="text-rose-500 transition-transform group-hover:scale-110" /> 
                Support the creator
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-[var(--bg-base)] bg-[var(--bg-surface-muted)] flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Join <span className="font-bold text-[var(--text-primary)]">{stats.activeUsers || '400+'}</span> active learners today
              </p>
            </div>
          </div>
          
          {/* Right Column (Visual) */}
          <div className="relative w-full">
             <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 blur-3xl opacity-50 dark:opacity-30 rounded-[40px] z-0"></div>
             
             <div className="relative z-10 w-full overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-black shadow-2xl shadow-emerald-900/5 dark:shadow-none h-[400px]">
                <BinaryTreeAnimation />
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
            {[
              [BookOpen, 'Structured roadmap', 'Move through the concepts in an order that makes sense.'],
              [BarChart3, 'Progress you can feel', 'See solved work, topic depth, and daily consistency at a glance.'],
              [Trophy, 'Friendly competition', 'Find motivation on the leaderboard without losing focus.']
            ].map(([Icon, title, copy]) => {
              const I = Icon as typeof BookOpen;
              return (
                <article key={String(title)} className="group flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-md)] hover:border-[var(--text-primary)]">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors group-hover:bg-[var(--text-primary)] group-hover:text-[var(--text-inverted)]">
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
