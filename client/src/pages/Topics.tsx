import React, { useEffect, useState } from 'react';
import { ArrowRight, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import { defaultTopics, getTopicIcon, type TopicDefinition } from '../data/topics';
import { fetchPublicTopics } from '../utils/topicApi';

const difficultyStyle: Record<string, string> = { 
  Easy: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30', 
  Medium: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30', 
  Hard: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30' 
};

const TopicsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState(''); 
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null); 
  const [topics, setTopics] = useState<TopicDefinition[]>([]); 
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { 
    fetchPublicTopics().then(setTopics).catch(() => setTopics(defaultTopics)).finally(() => setLoading(false)); 
  }, []);
  
  const shown = topics.filter(({ name, difficulty }) => 
    name.toLowerCase().includes(searchQuery.toLowerCase()) && 
    (!selectedDifficulty || difficulty === selectedDifficulty)
  );

  return (
    <div className="page-shell">
      <AnimatedBackground />
      <main className="page-wrap py-10 sm:py-14">
        <header className="border-b border-[var(--border-subtle)] pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">Topics</h1>
            <p className="mt-2 text-lg text-[var(--text-secondary)]">A deliberate collection of core DSA patterns.</p>
          </div>
          <p className="text-sm font-medium text-[var(--text-muted)]">{topics.length || '—'} tracks available</p>
        </header>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row mb-8">
          <label className="relative flex-1 block">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Search topics..." 
              className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--text-primary)] focus:ring-1 focus:ring-[var(--text-primary)]"
            />
          </label>
          <div className="flex gap-2">
            {['Easy', 'Medium', 'Hard'].map(diff => (
              <button 
                onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)} 
                key={diff} 
                className={`rounded-lg px-4 py-2.5 text-sm font-medium border transition-colors ${
                  selectedDifficulty === diff 
                    ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--text-inverted)]' 
                    : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({length: 6}).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]" />)}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map(topic => (
                <Link 
                  key={topic.id || topic.slug} 
                  to={`/topic/${topic.slug}`} 
                  className="group flex flex-col rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 transition-all hover:border-[var(--text-primary)] hover:shadow-[var(--shadow-sm)]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-surface-muted)] text-[var(--text-primary)]">
                      {getTopicIcon(topic.iconKey)}
                    </div>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${difficultyStyle[topic.difficulty]}`}>
                      {topic.difficulty}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{topic.name}</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 flex-1">
                    {topic.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 mt-auto">
                    <span className="text-sm text-[var(--text-muted)] font-medium">
                      {topic.problemCount || 0} problems
                    </span>
                    <span className="flex items-center gap-1 text-[var(--text-primary)] text-sm font-medium opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                      Open <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {!shown.length && (
              <div className="py-24 text-center rounded-xl border border-dashed border-[var(--border-strong)]">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--bg-surface-muted)] text-[var(--text-muted)]">
                  <Filter size={20} />
                </span>
                <h2 className="mt-4 font-semibold text-[var(--text-primary)]">No matching topics</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Try another search or difficulty.</p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TopicsPage;
