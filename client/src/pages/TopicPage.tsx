import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Code2, ExternalLink, Filter, Globe, Lock, Youtube } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import { apiUrl } from '../config';
import { defaultTopics, getTopicIcon, type TopicDefinition } from '../data/topics';
import { updateStoredUser } from '../utils/auth';
import { fetchPublicTopics } from '../utils/topicApi';
import { getCanonicalTopicSlug } from '../utils/topics';

interface Problem { id: number; title: string; link: string; tutorialLink?: string; solutionLink?: string; codeLink?: string; difficulty: 'Easy' | 'Medium' | 'Hard'; topic: string; }
const difficultyStyle: Record<string, string> = { Easy: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/15', Medium: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/15', Hard: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-400/15' };

const TopicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const normalizedSlug = getCanonicalTopicSlug(slug || '');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [catalog, setCatalog] = useState<TopicDefinition[]>(defaultTopics);
  const [solved, setSolved] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const topic = catalog.find(item => item.slug === normalizedSlug);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        setAuthenticated(Boolean(token));
        const apiSlug = normalizedSlug || getCanonicalTopicSlug(slug);
        const [topics, response] = await Promise.all([fetchPublicTopics().catch(() => defaultTopics), fetch(apiUrl(`/api/problems/${apiSlug}`))]);
        setCatalog(topics);
        const result = response.ok ? response : await fetch(apiUrl(`/api/problems/${slug}`));
        if (!result.ok) throw new Error('Failed to fetch problems');
        setProblems((await result.json()) || []);
        if (token) {
          const userResponse = await fetch(apiUrl('/api/auth/me'), { headers: { 'x-auth-token': token } });
          if (userResponse.ok) {
            setSolved((await userResponse.json()).solvedProblems?.map(String) || []);
          } else {
            setAuthenticated(false);
            setSyncMessage('Your session has expired. Please log in again to save progress.');
          }
        }
      } catch (loadError) { console.error(loadError); setError('Could not load data. Please refresh.'); }
      finally { setLoading(false); }
    };
    load();
  }, [normalizedSlug, slug]);

  const toggleProblem = async (id: number) => {
    if (!authenticated) return;
    setSyncMessage('');
    const value = String(id); const before = [...solved];
    setSolved(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
    try {
      const response = await fetch(apiUrl('/api/problems/sync'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.getItem('token') || '' }, body: JSON.stringify({ problemId: value }) });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        if (response.status === 401 || response.status === 403) {
          setAuthenticated(false);
          setSyncMessage(data?.msg || 'Your session has expired. Please log in again to save progress.');
        } else {
          setSyncMessage(data?.msg || 'Could not save this update. Please try again.');
        }
        throw new Error('Sync failed');
      }
      const updated = (await response.json()).map(String);
      setSolved(updated); updateStoredUser(user => ({ ...user, solvedProblems: updated }));
    } catch (syncError) { console.error(syncError); setSolved(before); }
  };

  const stats = useMemo(() => {
    const count = (level?: string) => { const list = level ? problems.filter(item => item.difficulty === level) : problems; return { total: list.length, solved: list.filter(item => solved.includes(String(item.id))).length }; };
    return { Total: count(), Easy: count('Easy'), Medium: count('Medium'), Hard: count('Hard') };
  }, [problems, solved]);
  const visible = problems.filter(item => filter === 'All' || item.difficulty === filter);

  return <div className="page-shell"><AnimatedBackground />
    <header className="sticky top-[72px] z-30 border-b border-slate-200/80 bg-[#f7f8f5]/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1110]/90"><div className="page-wrap py-5">
      <div className="flex items-center gap-4"><Link to="/topics" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-teal-700 dark:border-white/10 dark:bg-white/[.025] dark:hover:text-teal-300"><ArrowLeft size={17} /></Link><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-teal-700 dark:text-teal-300">Learning track</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight capitalize">{topic && <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#dceee9] text-[#123b36] dark:bg-teal-400/10 dark:text-teal-300">{getTopicIcon(topic.iconKey)}</span>}{topic?.name || normalizedSlug.replace(/-/g, ' ')}</h1></div></div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{Object.entries(stats).map(([label, value], index) => <StatBadge key={label} label={label} {...value} color={index === 0 ? 'bg-teal-500' : index === 1 ? 'bg-emerald-500' : index === 2 ? 'bg-amber-400' : 'bg-rose-500'} />)}</div>
    </div></header>
    <main className="page-wrap py-8">
      {loading && <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="surface h-16 animate-pulse rounded-xl" />)}</div>}
      {error && <div className="py-24 text-center text-rose-500"><AlertCircle className="mx-auto mb-3" /><p className="font-bold">{error}</p></div>}
      {!loading && !authenticated && !error && <div className="mb-6 flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 p-4 text-sm text-teal-800 dark:border-teal-400/10 dark:bg-teal-400/5 dark:text-teal-200"><Lock size={18} /><p><strong>Want to keep your progress?</strong> {syncMessage || 'Log in to save every solved problem.'}</p></div>}
      {!loading && authenticated && syncMessage && <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-400/10 dark:bg-rose-400/5 dark:text-rose-300">{syncMessage}</div>}
      {!loading && !error && <section className="surface overflow-hidden rounded-2xl"><div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200/80 p-4 dark:border-white/10"><Filter size={16} className="ml-1 text-slate-400" />{(['All', 'Easy', 'Medium', 'Hard'] as const).map(level => <button key={level} onClick={() => setFilter(level)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${filter === level ? 'bg-[#123b36] text-white dark:bg-teal-400 dark:text-[#08241f]' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>{level}</button>)}</div><div className="overflow-x-auto"><table className="w-full min-w-[760px] table-fixed text-left"><colgroup><col className="w-[5%]" /><col className="w-[7%]" /><col className="w-[42%]" /><col className="w-[16%]" /><col className="w-[14%]" /><col className="w-[16%]" /></colgroup><thead className="bg-[#fbfcfa] text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400 dark:bg-white/[.025]"><tr><th className="px-5 py-4">#</th><th className="px-5 py-4">Done</th><th className="px-5 py-4">Problem</th><th className="px-5 py-4">Platform</th><th className="px-5 py-4">Level</th><th className="px-5 py-4 text-right">Resources</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-white/[.06]">{visible.length ? visible.map((problem, index) => <ProblemRow key={problem.id} problem={problem} index={index} complete={solved.includes(String(problem.id))} authenticated={authenticated} onToggle={toggleProblem} />) : <tr><td colSpan={6} className="py-14 text-center text-sm text-slate-500">No problems found for this filter.</td></tr>}</tbody></table></div></section>}
    </main><Footer />
  </div>;
};

const ProblemRow = ({ problem, index, complete, authenticated, onToggle }: { problem: Problem; index: number; complete: boolean; authenticated: boolean; onToggle: (id: number) => void }) => {
  const platform = problem.link.includes('leetcode.com') ? ['LeetCode', 'text-amber-700 bg-amber-50 dark:bg-amber-400/10 dark:text-amber-300'] : problem.link.includes('geeksforgeeks.org') ? ['GFG', 'text-emerald-700 bg-emerald-50 dark:bg-emerald-400/10 dark:text-emerald-300'] : ['Link', 'text-teal-700 bg-teal-50 dark:bg-teal-400/10 dark:text-teal-300'];
  return <tr className={complete ? 'bg-teal-50/45 dark:bg-teal-400/[.04]' : 'hover:bg-slate-50/70 dark:hover:bg-white/[.02]'}><td className="px-5 py-4 font-mono text-xs text-slate-400">{index + 1}</td><td className="px-5 py-4"><button onClick={() => onToggle(problem.id)} disabled={!authenticated} aria-label={`Mark ${problem.title} as solved`} className={`grid h-6 w-6 place-items-center rounded-full border transition ${complete ? 'border-teal-600 bg-teal-600 text-white dark:border-teal-400 dark:bg-teal-400 dark:text-[#08241f]' : 'border-slate-300 text-transparent hover:border-teal-500 dark:border-white/20'} ${!authenticated ? 'cursor-not-allowed opacity-50' : ''}`}><CheckCircle2 size={15} /></button></td><td className="px-5 py-4"><a href={problem.link} target="_blank" rel="noreferrer" className={`block truncate font-bold transition ${complete ? 'text-slate-400 line-through' : 'hover:text-teal-700 dark:hover:text-teal-300'}`}>{problem.title}</a></td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-bold ${platform[1]}`}><Globe size={11} />{platform[0]}</span></td><td className="px-5 py-4"><span className={`inline-flex min-w-[68px] justify-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ${difficultyStyle[problem.difficulty]}`}>{problem.difficulty}</span></td><td className="px-5 py-4 text-right"><div className="inline-flex w-full justify-end gap-1"><Resource href={problem.tutorialLink || `https://www.google.com/search?q=${encodeURIComponent(`${problem.title} tutorial`)}`} label="Tutorial" Icon={Youtube} />{problem.codeLink && <Resource href={problem.codeLink} label="Code" Icon={Code2} />}<Resource href={problem.link} label="Solve" Icon={ExternalLink} /></div></td></tr>;
};
const Resource = ({ href, label, Icon }: { href: string; label: string; Icon: typeof Youtube }) => <a href={href} target="_blank" rel="noreferrer" title={label} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-400/10 dark:hover:text-teal-300"><Icon size={16} /></a>;
const StatBadge = ({ label, solved, total, color }: { label: string; solved: number; total: number; color: string }) => <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[.025]"><div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400"><span>{label}</span><i className={`h-2 w-2 rounded-full ${color}`} /></div><p className="mt-1.5 text-lg font-extrabold">{solved}<span className="ml-1 text-sm font-medium text-slate-400">/ {total}</span></p><div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className={`h-full rounded-full ${color}`} style={{ width: `${total ? solved / total * 100 : 0}%` }} /></div></div>;
export default TopicPage;
