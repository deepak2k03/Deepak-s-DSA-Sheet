import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mail, PieChart, Calendar, Trophy
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import { apiUrl } from '../config';
import { fetchPublicTopics } from '../utils/topicApi';
import { getCanonicalTopicSlug } from '../utils/topics';
import { type TopicDefinition } from '../data/topics';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
}

interface UserData {
  username: string;
  email: string;
  solvedProblems: string[];
  solvedHistory?: Array<{ problemId: string; solvedAt: string }>;
  createdAt: string;
}

interface HeatmapDay {
  date: Date;
  key: string;
  count: number;
  month: number;
}

const difficultyStyle: Record<string, string> = { 
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/15', 
  Medium: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/15', 
  Hard: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-400/15' 
};

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [topicCatalog, setTopicCatalog] = useState<TopicDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [userRes, probRes, topics] = await Promise.all([
          fetch(apiUrl('/api/auth/me'), { headers: { 'x-auth-token': token } }),
          fetch(apiUrl('/api/problems/all')),
          fetchPublicTopics(),
        ]);

        const userData = await userRes.json();
        const probData = await probRes.json();

        if (userRes.ok) setUser(userData);
        if (probRes.ok) setAllProblems(probData);
        setTopicCatalog(topics);

      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const heatmapData = useMemo(() => {
    if (!user) {
      return null;
    }

    const toDateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const solvedHistory = Array.isArray(user.solvedHistory) ? user.solvedHistory : [];
    const countsByDay = new Map<string, number>();
    solvedHistory.forEach((entry) => {
      if (!entry?.solvedAt) return;
      const solvedDate = new Date(entry.solvedAt);
      const dayKey = toDateKey(solvedDate);
      countsByDay.set(dayKey, (countsByDay.get(dayKey) || 0) + 1);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate 52 weeks ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (52 * 7) + 1);
    // Adjust to previous Sunday
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const weeks: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= today) {
      const key = toDateKey(currentDate);
      currentWeek.push({
        date: new Date(currentDate),
        key,
        count: countsByDay.get(key) || 0,
        month: currentDate.getMonth(),
      });

      if (currentDate.getDay() === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Push the last partial week
    if (currentWeek.length > 0) {
      // Pad to 7 days
      while (currentWeek.length < 7) {
        const nextDate = new Date(currentWeek[currentWeek.length - 1].date);
        nextDate.setDate(nextDate.getDate() + 1);
        currentWeek.push({
          date: nextDate,
          key: toDateKey(nextDate),
          count: 0,
          month: nextDate.getMonth()
        });
      }
      weeks.push(currentWeek);
    }

    // Month labels calculation
    const monthLabels: { label: string; index: number }[] = [];
    let lastMonth = -1;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    weeks.forEach((week, index) => {
      // Check the first day of the week
      const month = week[0].month;
      if (month !== lastMonth) {
        if (index > 0 || week[0].date.getDate() <= 14) {
          monthLabels.push({ label: monthNames[month], index });
        }
        lastMonth = month;
      }
    });

    // Streak logic
    let currentStreak = 0;
    let maxStreak = 0;
    let streakDate = new Date(today);

    while (true) {
       const key = toDateKey(streakDate);
       if ((countsByDay.get(key) || 0) > 0) {
          currentStreak++;
          streakDate.setDate(streakDate.getDate() - 1);
       } else {
           if (currentStreak === 0 && streakDate.getTime() === today.getTime()) {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const yKey = toDateKey(yesterday);
                if ((countsByDay.get(yKey) || 0) > 0) {
                    currentStreak++;
                    streakDate = yesterday;
                    streakDate.setDate(streakDate.getDate() - 1);
                    continue;
                }
           }
           break;
       }
    }

    const sortedDates = Array.from(countsByDay.keys()).sort();
    let tempStreak = 0;
    let previousDate: Date | null = null;

    for (const dateStr of sortedDates) {
         const d = new Date(dateStr);
         if (!previousDate) {
             tempStreak = 1;
         } else {
             const diffTime = Math.abs(d.getTime() - previousDate.getTime());
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             if (diffDays === 1) {
                 tempStreak++;
             } else {
                 tempStreak = 1;
             }
         }
         if (tempStreak > maxStreak) {
             maxStreak = tempStreak;
         }
         previousDate = d;
    }


    return {
      weeks,
      monthLabels,
      currentStreak,
      maxStreak,
      countsByDay
    };
  }, [user]);

  const getColorClass = (count: number, isFuture: boolean) => {
    if (isFuture) return 'bg-transparent';
    if (count === 0) return 'bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]';
    if (count <= 2) return 'bg-[var(--text-primary)] opacity-40 border border-[var(--bg-base)]';
    if (count <= 4) return 'bg-[var(--text-primary)] opacity-70 border border-[var(--bg-base)]';
    return 'bg-[var(--text-primary)] border border-[var(--bg-base)]';
  };

  const topicProgress = useMemo(() => {
    if (!user || allProblems.length === 0 || topicCatalog.length === 0) return [];
    
    return topicCatalog.map(topic => {
      const canonicalTopicSlug = getCanonicalTopicSlug(topic.slug);
      const topicProbs = allProblems.filter(p => {
         const pSlug = getCanonicalTopicSlug(p.topic);
         return pSlug === canonicalTopicSlug || p.topic.toLowerCase() === topic.name.toLowerCase();
      });
      
      const solvedTopicProbs = topicProbs.filter(p => user.solvedProblems.includes(String(p.id)));
      
      return {
        id: topic.id || topic.slug,
        name: topic.name,
        slug: topic.slug,
        total: topicProbs.length,
        solved: solvedTopicProbs.length,
        percentage: topicProbs.length > 0 ? (solvedTopicProbs.length / topicProbs.length) * 100 : 0
      };
    }).sort((a, b) => b.percentage - a.percentage).filter(t => t.total > 0);
  }, [user, allProblems, topicCatalog]);

  const difficultyStats = useMemo(() => {
    if (!user || allProblems.length === 0) return { Easy: { total: 0, solved: 0 }, Medium: { total: 0, solved: 0 }, Hard: { total: 0, solved: 0 } };
    
    const stats = {
      Easy: { total: 0, solved: 0 },
      Medium: { total: 0, solved: 0 },
      Hard: { total: 0, solved: 0 }
    };

    allProblems.forEach(p => {
       if (stats[p.difficulty]) {
           stats[p.difficulty].total++;
           if (user.solvedProblems.includes(String(p.id))) {
               stats[p.difficulty].solved++;
           }
       }
    });

    return stats;
  }, [user, allProblems]);

  if (loading) {
     return (
       <div className="page-shell flex min-h-screen items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)]"></div>
       </div>
     )
  }

  if (!user) {
    return (
       <div className="page-shell">
         <AnimatedBackground />
         <div className="page-wrap max-w-5xl mx-auto py-20 text-center">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Please sign in to view your profile.</h1>
         </div>
       </div>
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page-shell">
      <AnimatedBackground />
      <main className="page-wrap max-w-6xl mx-auto py-10 sm:py-14">
        
        {/* Profile Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-5">
             <div className="h-16 w-16 rounded-full bg-[var(--text-primary)] text-[var(--text-inverted)] flex items-center justify-center text-2xl font-bold uppercase tracking-wider">
               {user.username.charAt(0)}
             </div>
             <div>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{user.username}</h1>
                <div className="mt-1 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                   <span className="flex items-center gap-1"><Mail size={14}/> {user.email}</span>
                   <span className="flex items-center gap-1"><Calendar size={14}/> Joined {joinDate}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main Content Area */}
          <div className="space-y-8 min-w-0">
            
            {/* Heatmap Section */}
            {heatmapData && (
              <section className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
                 <div className="mb-6 flex items-end justify-between">
                    <div>
                       <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                         <Calendar size={18} className="text-[var(--text-muted)]"/> Activity
                       </h2>
                    </div>
                    <div className="text-right text-sm">
                       <p className="font-semibold text-[var(--text-primary)]">{user.solvedProblems.length} submissions in the last year</p>
                    </div>
                 </div>

                 <div className="overflow-x-auto pb-4">
                    <div className="min-w-max flex gap-2">
                        {/* Weekday Labels */}
                        <div className="flex flex-col gap-[3px] text-[10px] font-medium text-[var(--text-muted)] mt-[28px]">
                            <div className="h-3 flex items-center justify-end pr-1">Sun</div>
                            <div className="h-3 flex items-center justify-end pr-1">Mon</div>
                            <div className="h-3 flex items-center justify-end pr-1">Tue</div>
                            <div className="h-3 flex items-center justify-end pr-1">Wed</div>
                            <div className="h-3 flex items-center justify-end pr-1">Thu</div>
                            <div className="h-3 flex items-center justify-end pr-1">Fri</div>
                            <div className="h-3 flex items-center justify-end pr-1">Sat</div>
                        </div>

                        <div>
                            <div className="relative flex h-5 mb-2 text-[10px] font-medium text-[var(--text-muted)]">
                               {heatmapData.monthLabels.map(m => (
                                 <div 
                                   key={m.index} 
                                   className="absolute"
                                   style={{ left: `${m.index * 15}px` }}
                                 >
                                   {m.label}
                                 </div>
                               ))}
                            </div>
                            <div className="flex gap-[3px]">
                               {heatmapData.weeks.map((week, i) => (
                                 <div key={i} className="flex flex-col gap-[3px]">
                                    {week.map((day, j) => {
                                      const isFuture = day.date > new Date();
                                      return (
                                        <div 
                                          key={day.key} 
                                          className={`w-3 h-3 rounded-[2px] ${getColorClass(day.count, isFuture)} ${!isFuture && 'transition-transform hover:scale-125 cursor-pointer'}`}
                                          title={isFuture ? undefined : `${day.count} submissions on ${day.date.toDateString()}`}
                                        />
                                      );
                                    })}
                                 </div>
                               ))}
                            </div>
                        </div>
                    </div>
                 </div>
                 
                 <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-sm">
                    <div className="flex gap-6">
                       <div>
                          <p className="text-[var(--text-muted)] text-xs">Current Streak</p>
                          <p className="font-bold text-[var(--text-primary)]">{heatmapData.currentStreak} days</p>
                       </div>
                       <div>
                          <p className="text-[var(--text-muted)] text-xs">Max Streak</p>
                          <p className="font-bold text-[var(--text-primary)]">{heatmapData.maxStreak} days</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--text-muted)]">
                       Less
                       <div className="flex gap-[3px]">
                          {[0, 1, 3, 5].map(c => (
                             <div key={c} className={`w-3 h-3 rounded-[2px] ${getColorClass(c, false)}`} />
                          ))}
                       </div>
                       More
                    </div>
                 </div>
              </section>
            )}

            {/* Topic Progress Section */}
            <section className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
                <h2 className="mb-6 text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                   <PieChart size={18} className="text-[var(--text-muted)]"/> Topic Progress
                </h2>
                
                <div className="grid gap-4 sm:grid-cols-2">
                   {topicProgress.slice(0, 10).map(topic => (
                      <div key={topic.id} className="rounded-xl border border-[var(--border-subtle)] p-4 bg-[var(--bg-base)]">
                         <div className="flex justify-between items-end mb-2">
                            <h3 className="font-semibold text-[var(--text-primary)] text-sm truncate pr-4">{topic.name}</h3>
                            <span className="text-xs font-medium text-[var(--text-muted)] whitespace-nowrap">{topic.solved} / {topic.total}</span>
                         </div>
                         <div className="h-1.5 w-full rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-[var(--text-primary)]" 
                              style={{ width: `${topic.percentage}%` }}
                            />
                         </div>
                      </div>
                   ))}
                </div>
            </section>

          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
             
             {/* Stats Summary */}
             <section className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
                <div className="flex flex-col items-center justify-center pb-6 border-b border-[var(--border-subtle)] mb-6 text-center">
                   <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-surface-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)] mb-4">
                     <Trophy size={20} />
                   </div>
                   <h2 className="text-4xl font-bold text-[var(--text-primary)]">{user.solvedProblems.length}</h2>
                   <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-widest mt-1">Problems Solved</p>
                </div>

                <div className="space-y-4">
                   {(['Easy', 'Medium', 'Hard'] as const).map(diff => (
                      <div key={diff}>
                         <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-[var(--text-secondary)]">{diff}</span>
                            <span className="font-semibold text-[var(--text-primary)]">
                               {difficultyStats[diff].solved} <span className="text-[var(--text-muted)] font-normal">/ {difficultyStats[diff].total}</span>
                            </span>
                         </div>
                         <div className="h-1.5 w-full rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${diff === 'Easy' ? 'bg-emerald-500' : diff === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'}`} 
                              style={{ width: `${difficultyStats[diff].total > 0 ? (difficultyStats[diff].solved / difficultyStats[diff].total) * 100 : 0}%` }}
                            />
                         </div>
                      </div>
                   ))}
                </div>
             </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;