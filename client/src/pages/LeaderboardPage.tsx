import React, { useEffect, useState } from 'react';
import { Crown, Medal, Trophy } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import { apiUrl } from '../config';
import { getStoredUser } from '../utils/auth';

interface LeaderboardUser { 
  username: string; 
  solvedCount: number; 
  rank?: number; 
}

const LeaderboardPage: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => { 
    (async () => { 
      try { 
        const res = await fetch(apiUrl('/api/auth/leaderboard')); 
        const data = await res.json(); 
        if (res.ok) setUsers(data); 
        setCurrentUser(getStoredUser()?.username || null); 
      } catch (error) { 
        console.error('Failed to fetch leaderboard', error); 
      } finally { 
        setLoading(false); 
      } 
    })(); 
  }, []);

  const medal = (index: number, rank: number) => {
    if (index === 0) {
      return (
        <div className="flex flex-col items-center">
          <Crown size={20} className="text-amber-500 fill-amber-500" />
          <span className="text-[10px] font-bold text-[var(--text-muted)] mt-1">#{rank}</span>
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="flex flex-col items-center">
          <Medal size={18} className="text-slate-400 fill-slate-300" />
          <span className="text-[10px] font-bold text-[var(--text-muted)] mt-1">#{rank}</span>
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="flex flex-col items-center">
          <Medal size={18} className="text-amber-700 fill-amber-600" />
          <span className="text-[10px] font-bold text-[var(--text-muted)] mt-1">#{rank}</span>
        </div>
      );
    }
    return <span className="font-mono text-sm font-semibold text-[var(--text-muted)]">#{rank}</span>;
  };

  return (
    <div className="page-shell">
      <AnimatedBackground />
      <main className="page-wrap max-w-4xl py-10 sm:py-14">
        <header className="border-b border-[var(--border-subtle)] pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
              <Trophy size={14} className="text-[var(--text-primary)]" />
              <span>Community progress</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">Leaderboard</h1>
            <p className="mt-3 text-lg text-[var(--text-secondary)]">A live view of learners building consistency.</p>
          </div>
          <p className="text-sm font-medium text-[var(--text-muted)]">Top {users.length || '—'} learners</p>
        </header>

        {loading ? (
          <div className="mt-8 space-y-3">
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} className="h-[76px] animate-pulse rounded-xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]"/>
            ))}
          </div>
        ) : (
          <section className="mt-8 overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
            <div className="grid grid-cols-[80px_1fr_auto] gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] sm:px-8">
              <span className="text-center">Rank</span>
              <span>Developer</span>
              <span className="text-right">Solved</span>
            </div>
            
            <div className="divide-y divide-[var(--border-subtle)]">
              {users.map((user, index) => { 
                const rank = user.rank ?? index + 1; 
                const isCurrent = user.username === currentUser; 
                
                return (
                  <div 
                    key={user.username} 
                    className={`grid grid-cols-[80px_1fr_auto] items-center gap-4 px-5 py-4 transition-colors sm:px-8 ${
                      isCurrent ? 'bg-[var(--bg-surface-muted)]/60' : 'hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    <div className="flex justify-center">{medal(index, rank)}</div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                        index === 1 ? 'bg-slate-100 text-slate-800 border border-slate-200' : 
                        index === 2 ? 'bg-orange-100 text-orange-900 border border-orange-200' : 
                        'bg-[var(--bg-surface-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                      }`}>
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${isCurrent ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                          {user.username}
                        </p>
                        {isCurrent && (
                          <span className="rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--text-muted)]">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right flex items-baseline gap-1">
                      <span className="font-mono text-lg font-bold text-[var(--text-primary)]">
                        {user.solvedCount}
                      </span>
                      <span className="text-xs font-semibold uppercase text-[var(--text-muted)]">
                        Qs
                      </span>
                    </div>
                  </div>
                ); 
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LeaderboardPage;
