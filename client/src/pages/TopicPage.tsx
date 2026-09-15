import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Code2, ExternalLink, Filter, Globe, Lock, Youtube, Star, FileText, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import { apiUrl } from '../config';
import { defaultTopics, getTopicIcon, type TopicDefinition } from '../data/topics';
import { updateStoredUser } from '../utils/auth';
import { fetchPublicTopics } from '../utils/topicApi';
import { getCanonicalTopicSlug } from '../utils/topics';

interface Problem { id: number; title: string; link: string; tutorialLink?: string; solutionLink?: string; codeLink?: string; videoSolutionUrl?: string; difficulty: 'Easy' | 'Medium' | 'Hard'; topic: string; }

const difficultyStyle: Record<string, string> = { 
  Easy: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-900/30', 
  Medium: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-900/30', 
  Hard: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-900/30' 
};

const TopicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const normalizedSlug = getCanonicalTopicSlug(slug || '');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [catalog, setCatalog] = useState<TopicDefinition[]>(defaultTopics);
  const [solved, setSolved] = useState<string[]>([]);
  const [revisions, setRevisions] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<{ id: string, text: string } | null>(null);
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
            const userData = await userResponse.json();
            setSolved(userData.solvedProblems?.map(String) || []);
            setRevisions(userData.revisionProblems?.map(String) || []);
            
            const notesMap: Record<string, string> = {};
            userData.problemNotes?.forEach((n: any) => {
              notesMap[String(n.problemId)] = n.note;
            });
            setNotes(notesMap);
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

  const toggleRevision = async (id: number) => {
    if (!authenticated) return;
    setSyncMessage('');
    const value = String(id);
    const before = [...revisions];
    setRevisions(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
    try {
      const response = await fetch(apiUrl('/api/problems/sync-revision'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.getItem('token') || '' },
        body: JSON.stringify({ problemId: value })
      });
      if (!response.ok) throw new Error('Sync failed');
      const updated = (await response.json()).map(String);
      setRevisions(updated);
    } catch (error) {
      console.error(error);
      setRevisions(before);
      setSyncMessage('Could not sync revision status.');
    }
  };

  const saveNote = async () => {
    if (!authenticated || !editingNote) return;
    const { id, text } = editingNote;
    const beforeNotes = { ...notes };
    
    setNotes(prev => {
      const next = { ...prev };
      if (!text.trim()) delete next[id];
      else next[id] = text;
      return next;
    });
    setEditingNote(null);

    try {
      const response = await fetch(apiUrl('/api/problems/sync-note'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.getItem('token') || '' },
        body: JSON.stringify({ problemId: id, note: text })
      });
      if (!response.ok) throw new Error('Sync failed');
      
      const updatedNotes = await response.json();
      const notesMap: Record<string, string> = {};
      updatedNotes.forEach((n: any) => {
        notesMap[String(n.problemId)] = n.note;
      });
      setNotes(notesMap);
    } catch (error) {
      console.error(error);
      setNotes(beforeNotes);
      setSyncMessage('Could not save note.');
    }
  };

  const stats = useMemo(() => {
    const count = (level?: string) => { const list = level ? problems.filter(item => item.difficulty === level) : problems; return { total: list.length, solved: list.filter(item => solved.includes(String(item.id))).length }; };
    return { Total: count(), Easy: count('Easy'), Medium: count('Medium'), Hard: count('Hard') };
  }, [problems, solved]);
  
  const visible = problems.filter(item => filter === 'All' || item.difficulty === filter);

  return (
    <div className="page-shell">
      <AnimatedBackground />
      
      {/* Sticky Header */}
      <header className="sticky top-[64px] z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-md">
        <div className="page-wrap py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/topics" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Learning track</p>
              <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] capitalize">
                {topic && <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--bg-surface-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)]">{getTopicIcon(topic.iconKey, 18)}</span>}
                {topic?.name || normalizedSlug.replace(/-/g, ' ')}
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(stats).map(([label, value], index) => (
              <StatBadge key={label} label={label} {...value} color={index === 0 ? 'bg-[var(--text-primary)]' : index === 1 ? 'bg-emerald-500' : index === 2 ? 'bg-amber-500' : 'bg-rose-500'} />
            ))}
          </div>
        </div>
      </header>

      <main className="page-wrap py-8">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]" />)}
          </div>
        )}
        
        {error && (
          <div className="py-24 text-center text-rose-500">
            <AlertCircle className="mx-auto mb-3" />
            <p className="font-bold">{error}</p>
          </div>
        )}
        
        {!loading && !authenticated && !error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-primary)] shadow-[var(--shadow-sm)]">
            <Lock size={18} className="text-[var(--text-muted)]" />
            <p><strong>Track your progress.</strong> {syncMessage || 'Log in to save completed problems permanently.'}</p>
          </div>
        )}
        
        {!loading && authenticated && syncMessage && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-200">
            {syncMessage}
          </div>
        )}
        
        {!loading && !error && (
          <section className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto border-b border-[var(--border-subtle)] p-3">
              <Filter size={16} className="ml-2 text-[var(--text-muted)]" />
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map(level => (
                <button 
                  key={level} 
                  onClick={() => setFilter(level)} 
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    filter === level 
                      ? 'bg-[var(--text-primary)] text-[var(--text-inverted)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] table-fixed text-left">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[5%]" />
                  <col className="w-[40%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead className="bg-[var(--bg-surface-muted)] text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  <tr>
                    <th className="px-5 py-3 border-b border-[var(--border-subtle)]">#</th>
                    <th className="px-5 py-3 border-b border-[var(--border-subtle)]">Done</th>
                    <th className="px-5 py-3 border-b border-[var(--border-subtle)]">Problem</th>
                    <th className="px-5 py-3 border-b border-[var(--border-subtle)] text-center">Notes</th>
                    <th className="px-5 py-3 border-b border-[var(--border-subtle)] text-center">Revise</th>
                    <th className="px-5 py-3 border-b border-[var(--border-subtle)] text-center">Platform</th>
                    <th className="px-5 py-3 border-b border-[var(--border-subtle)] text-center">Level</th>
                    <th className="px-5 py-3 border-b border-[var(--border-subtle)] text-center">Resources</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {visible.length ? visible.map((problem, index) => (
                    <ProblemRow 
                      key={problem.id} 
                      problem={problem} 
                      index={index} 
                      complete={solved.includes(String(problem.id))} 
                      isRevision={revisions.includes(String(problem.id))}
                      hasNote={!!notes[String(problem.id)]}
                      authenticated={authenticated} 
                      onToggle={toggleProblem} 
                      onToggleRevision={toggleRevision}
                      onEditNote={() => setEditingNote({ id: String(problem.id), text: notes[String(problem.id)] || '' })}
                    />
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-sm text-[var(--text-muted)]">
                        No problems found for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
      <Footer />
      
      {editingNote && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Problem Notes</h3>
              <button onClick={() => setEditingNote(null)} className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            <textarea
              value={editingNote.text}
              onChange={(e) => setEditingNote({ ...editingNote, text: e.target.value })}
              placeholder="Write your notes here..."
              className="min-h-[150px] w-full resize-y rounded-xl border border-[var(--border-strong)] bg-[var(--bg-base)] p-3 text-[var(--text-primary)] outline-none focus:border-blue-500 transition-colors"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setEditingNote(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors">Cancel</button>
              <button onClick={saveNote} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">Save Note</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const ProblemRow = ({ problem, index, complete, isRevision, hasNote, authenticated, onToggle, onToggleRevision, onEditNote }: { problem: Problem; index: number; complete: boolean; isRevision: boolean; hasNote: boolean; authenticated: boolean; onToggle: (id: number) => void; onToggleRevision: (id: number) => void; onEditNote: () => void }) => {
  const platform = problem.link.includes('leetcode.com') 
    ? ['LeetCode', 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400'] 
    : problem.link.includes('geeksforgeeks.org') 
      ? ['GFG', 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400'] 
      : ['Link', 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400'];

  return (
    <tr className={`transition-colors ${complete ? 'bg-[var(--bg-surface-muted)]/50 opacity-70' : 'hover:bg-[var(--bg-surface-hover)]'}`}>
      <td className="px-5 py-4 font-mono text-xs text-[var(--text-muted)]">{index + 1}</td>
      <td className="px-5 py-4">
        <button 
          onClick={() => onToggle(problem.id)} 
          disabled={!authenticated} 
          aria-label={`Mark ${problem.title} as solved`} 
          className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
            complete 
              ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--text-inverted)]' 
              : 'border-[var(--border-strong)] text-transparent hover:border-[var(--text-secondary)]'
          } ${!authenticated ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <CheckCircle2 size={12} strokeWidth={3} />
        </button>
      </td>
      <td className="px-5 py-4">
        <a 
          href={problem.link} 
          target="_blank" 
          rel="noreferrer" 
          className={`block truncate font-medium transition-colors ${
            complete ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)] hover:text-[var(--text-secondary)]'
          }`}
        >
          {problem.title}
        </a>
      </td>
      <td className="px-5 py-4 text-center">
        <button onClick={onEditNote} disabled={!authenticated} aria-label="Edit Note" className={`text-[var(--text-muted)] hover:text-blue-500 transition-colors ${!authenticated ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <FileText size={18} className={hasNote ? 'text-blue-500 fill-blue-500/20' : ''} />
        </button>
      </td>
      <td className="px-5 py-4 text-center">
        <button onClick={() => onToggleRevision(problem.id)} disabled={!authenticated} aria-label="Mark for Revision" className={`text-[var(--text-muted)] hover:text-yellow-500 transition-colors ${!authenticated ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Star size={18} className={isRevision ? 'text-yellow-500 fill-yellow-500' : ''} />
        </button>
      </td>
      <td className="px-5 py-4 text-center">
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${platform[1]}`}>
          <Globe size={11} />
          {platform[0]}
        </span>
      </td>
      <td className="px-5 py-4 text-center">
        <span className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium ${difficultyStyle[problem.difficulty]}`}>
          {problem.difficulty}
        </span>
      </td>
      <td className="px-5 py-4 text-center">
        <div className="inline-flex w-full justify-center gap-1">
          <Resource href={problem.videoSolutionUrl || problem.tutorialLink || `https://www.google.com/search?q=${encodeURIComponent(`${problem.title} tutorial`)}`} label="Tutorial" Icon={Youtube} />
          <Resource href={`/problem/${problem.id}/solution`} label="Code" Icon={Code2} />
        </div>
      </td>
    </tr>
  );
};

const Resource = ({ href, label, Icon }: { href: string; label: string; Icon: typeof Youtube }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noreferrer" 
    title={label} 
    className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface-muted)] hover:text-[var(--text-primary)]"
  >
    <Icon size={14} />
  </a>
);

const StatBadge = ({ label, solved, total, color }: { label: string; solved: number; total: number; color: string }) => (
  <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-3 shadow-[var(--shadow-xs)]">
    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
      <span>{label}</span>
      <i className={`h-1.5 w-1.5 rounded-full ${color}`} />
    </div>
    <p className="mt-1 flex items-baseline gap-1 text-xl font-bold text-[var(--text-primary)]">
      {solved}
      <span className="text-sm font-medium text-[var(--text-muted)]">/ {total}</span>
    </p>
    <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-[var(--bg-surface-muted)]">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${total ? (solved / total) * 100 : 0}%` }} />
    </div>
  </div>
);

export default TopicPage;
