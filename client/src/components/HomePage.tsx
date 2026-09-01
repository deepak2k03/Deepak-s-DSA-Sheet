import React, { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, BookOpen, Flame, Heart, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../config';
import { defaultTopics } from '../data/topics';
import { fetchPublicTopics } from '../utils/topicApi';
import AnimatedBackground from './AnimatedBackground';
import Footer from './Footer';

const HomePage: React.FC = () => {
  const [stats, setStats] = useState({ totalProblems: 0, activeUsers: 0, topicsCount: 0, totalSolves: 0 });
  useEffect(() => {
    const load = async () => { try {
      const [problems, users, topics] = await Promise.all([fetch(apiUrl('/api/problems/all')), fetch(apiUrl('/api/auth/leaderboard')), fetchPublicTopics().catch(() => defaultTopics)]);
      const problemData = await problems.json(); const userData = await users.json();
      setStats({ totalProblems: Array.isArray(problemData) ? problemData.length : 0, activeUsers: Array.isArray(userData) ? userData.length : 0, topicsCount: topics.length, totalSolves: Array.isArray(userData) ? userData.reduce((sum: number, user: { solvedCount?: number }) => sum + (user.solvedCount || 0), 0) : 0 });
    } catch { setStats({ totalProblems: 450, activeUsers: 0, topicsCount: defaultTopics.length, totalSolves: 0 }); } };
    load();
  }, []);
  return <div className="page-shell overflow-hidden"><AnimatedBackground />
    <main>
      <section className="page-wrap relative grid min-h-[560px] items-center gap-14 py-10 lg:grid-cols-[1.05fr_.95fr] lg:py-14">
        <div className="animate-enter relative z-10">
          <p className="eyebrow mb-7"><span className="h-2 w-2 rounded-full bg-teal-500" /> A better way to practice</p>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.04] tracking-[-.055em] text-[#102b27] sm:text-6xl lg:text-7xl dark:text-white">Practice with direction. <span className="text-teal-700 dark:text-teal-300">Improve with intent.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">A thoughtfully curated DSA roadmap that helps you recognize patterns, build momentum, and see every bit of progress.</p>
          <div className="mt-9 flex flex-wrap items-center gap-3"><Link to="/topics" className="button-primary">Explore the roadmap <ArrowRight size={17} /></Link><Link to="/potd" className="button-secondary"><Flame size={17} className="text-orange-500" /> Today's challenge</Link><Link to="/support" className="button-secondary text-[#123b36] hover:border-teal-600/30 hover:shadow-lg hover:shadow-teal-950/5 dark:text-teal-200"><Heart size={16} className="fill-rose-100 text-rose-500" /> Support the creator</Link></div>
        </div>
        <div className="animate-enter relative" style={{ animationDelay: '120ms' }}>
          <div className="surface relative overflow-hidden rounded-[28px] p-5 shadow-2xl shadow-teal-950/10 sm:p-7">
            <div className="flex items-start justify-between"><div><p className="eyebrow"><TrendingUp size={14}/> Learning momentum</p><h2 className="mt-3 text-xl font-extrabold tracking-tight">Your growth has a direction.</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Every solved pattern builds on the last.</p></div><span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-extrabold text-teal-800 dark:bg-teal-400/10 dark:text-teal-300">+24% this month</span></div>
            <div className="relative mt-8 rounded-2xl bg-[#102b27] px-5 pb-5 pt-7 text-white sm:px-7">
              <div className="absolute inset-x-5 top-7 bottom-12 opacity-20 sm:inset-x-7 [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:100%_25%,25%_100%]"/>
              <div className="relative flex items-center justify-between"><p className="text-sm font-bold text-teal-100">Pattern confidence</p><p className="font-mono text-xs text-teal-200">JAN → JUN</p></div>
              <svg viewBox="0 0 520 220" className="relative mt-3 h-48 w-full overflow-visible" role="img" aria-label="A steadily rising learning progress graph">
                <defs><linearGradient id="learning-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#5eead4" stopOpacity=".38"/><stop offset="100%" stopColor="#5eead4" stopOpacity="0"/></linearGradient></defs>
                <path d="M10 195 C55 190 62 168 101 174 S148 146 181 153 S223 128 258 133 S302 97 337 106 S374 74 409 78 S459 35 510 25 L510 210 L10 210 Z" fill="url(#learning-fill)"/>
                <path d="M10 195 C55 190 62 168 101 174 S148 146 181 153 S223 128 258 133 S302 97 337 106 S374 74 409 78 S459 35 510 25" fill="none" stroke="#5eead4" strokeWidth="5" strokeLinecap="round"/>
                {[[10,195],[101,174],[181,153],[258,133],[337,106],[409,78],[510,25]].map(([x,y], i) => <circle key={i} cx={x} cy={y} r={i === 6 ? 7 : 4} fill={i === 6 ? '#ccfbf1' : '#5eead4'} stroke="#102b27" strokeWidth="3"/>)}
                <g transform="translate(420,0)"><rect width="91" height="32" rx="16" fill="#ccfbf1"/><text x="45" y="21" textAnchor="middle" fill="#123b36" fontSize="12" fontWeight="700">Keep climbing</text></g>
              </svg>
              <div className="relative mt-1 grid grid-cols-4 text-[10px] font-bold uppercase tracking-[.14em] text-teal-100/60"><span>Start</span><span className="text-center">Patterns</span><span className="text-center">Speed</span><span className="text-right">Mastery</span></div>
            </div>
            <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200/80 rounded-2xl border border-slate-200/80 bg-[#fbfcfa] py-4 dark:divide-white/10 dark:border-white/10 dark:bg-white/[.025]">{[['01','Learn'],['02','Practice'],['03','Improve']].map(([number,label]) => <div key={number} className="px-3 text-center"><p className="font-mono text-xs text-teal-700 dark:text-teal-300">{number}</p><p className="mt-1 text-xs font-extrabold">{label}</p></div>)}</div>
          </div>
        </div>
      </section>
      <section className="border-y border-slate-200/80 bg-white/55 dark:border-white/10 dark:bg-white/[.025]"><div className="page-wrap grid grid-cols-2 divide-x divide-slate-200/80 dark:divide-white/10 md:grid-cols-4">{[[stats.totalProblems,'Curated problems'],[stats.topicsCount,'Learning tracks'],[stats.totalSolves,'Problems solved'],[stats.activeUsers,'Active learners']].map(([value,label]) => <div key={String(label)} className="px-5 py-8 text-center"><p className="font-mono text-3xl font-medium text-[#123b36] dark:text-teal-300">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p></div>)}</div></section>
      <section className="page-wrap py-24"><div className="flex max-w-2xl flex-col gap-4"><p className="eyebrow"><Sparkles size={14}/> Made for the long game</p><h2 className="text-4xl font-extrabold tracking-[-.04em] text-[#102b27] dark:text-white">Everything meaningful stays within reach.</h2><p className="text-slate-600 dark:text-slate-400">No busy dashboard. Just a clear system for learning patterns and maintaining momentum.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{[[BookOpen,'Structured roadmap','Move through the concepts in an order that makes sense.'],[BarChart3,'Progress you can feel','See solved work, topic depth, and daily consistency at a glance.'],[Trophy,'Friendly competition','Find motivation on the leaderboard without losing focus.']].map(([Icon,title,copy]) => { const I = Icon as typeof BookOpen; return <article key={String(title)} className="surface rounded-2xl p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-950/5"><span className="mb-7 grid h-11 w-11 place-items-center rounded-xl bg-[#dceee9] text-[#123b36] dark:bg-teal-400/10 dark:text-teal-300"><I size={21}/></span><h3 className="text-lg font-extrabold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{copy}</p></article>})}</div></section>
    </main><Footer />
  </div>;
};
export default HomePage;
