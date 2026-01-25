import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, ExternalLink, Code2, FileText, 
  CheckCircle2, AlertCircle, Lock, Filter,
  Globe
} from 'lucide-react';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

// ✅ Imports
import { topics } from '../data/topics'; 
import { API_URL } from '../config';

interface Problem {
  id: number;
  title: string;
  link: string;
  solutionLink?: string;
  codeLink?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
}

const TopicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); 
  const topicInfo = topics.find(t => t.slug === slug);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Filter State
  const [filter, setFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  // --- 1. Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);

        // ✅ FIXED: Use API_URL
        const probRes = await fetch(`${API_URL}/api/problems/${slug}`);
        if (!probRes.ok) throw new Error('Failed to fetch problems');
        const probData = await probRes.json();
        setProblems(Array.isArray(probData) ? probData : []);

        // Fetch User Progress
        if (token) {
          // ✅ FIXED: Use API_URL
          const userRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'x-auth-token': token }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            const safeSolved = Array.isArray(userData.solvedProblems) ? userData.solvedProblems : [];
            setSolvedProblems(safeSolved.map(String)); 
          }
        }
      } catch (err) {
        console.error(err);
        setError('Could not load data. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  // --- 2. Toggle Logic ---
  const toggleProblem = async (problemId: number) => {
    if (!isAuthenticated) return;
    const idStr = String(problemId);
    const originalState = [...solvedProblems];
    
    setSolvedProblems(prev => 
      prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]
    );

    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      const res = await fetch(`${API_URL}/api/problems/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
        body: JSON.stringify({ problemId: idStr }) 
      });

      if (!res.ok) throw new Error('Sync failed');
      const updatedList = await res.json();
      if (Array.isArray(updatedList)) setSolvedProblems(updatedList.map(String));
    } catch (err) {
      console.error("Sync failed", err);
      setSolvedProblems(originalState);
    }
  };

  // --- Calculations & Helpers ---

  // Calculate detailed stats
  const stats = useMemo(() => {
    const calc = (diff: string) => ({
      total: problems.filter(p => p.difficulty === diff).length,
      solved: problems.filter(p => p.difficulty === diff && solvedProblems.includes(String(p.id))).length
    });
    return {
      Easy: calc('Easy'),
      Medium: calc('Medium'),
      Hard: calc('Hard'),
      Total: {
        total: problems.length,
        solved: solvedProblems.length
      }
    };
  }, [problems, solvedProblems]);

  // Determine Platform from URL
  const getPlatform = (url: string) => {
    if (url.includes('leetcode.com')) return { name: 'LeetCode', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' };
    if (url.includes('geeksforgeeks.org')) return { name: 'GFG', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' };
    if (url.includes('codingninjas.com')) return { name: 'Ninjas', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400' };
    return { name: 'Link', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' };
  };

  // Filter the list
  const filteredProblems = problems.filter(p => filter === 'All' || p.difficulty === filter);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <AnimatedBackground />
      
      {/* --- HEADER --- */}
      <div className="sticky top-16 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/topics" className="group p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold capitalize text-slate-900 dark:text-white flex items-center gap-3">
                  {topicInfo && <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{topicInfo.icon}</span>}
                  {topicInfo ? topicInfo.name : slug?.replace('-', ' ')}
                </h1>
              </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               <StatBadge label="Total" solved={stats.Total.solved} total={stats.Total.total} color="bg-blue-500" />
               <StatBadge label="Easy" solved={stats.Easy.solved} total={stats.Easy.total} color="bg-emerald-500" />
               <StatBadge label="Medium" solved={stats.Medium.solved} total={stats.Medium.total} color="bg-amber-500" />
               <StatBadge label="Hard" solved={stats.Hard.solved} total={stats.Hard.total} color="bg-rose-500" />
            </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {loading && (
          <div className="space-y-4 animate-pulse mt-8">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-rose-500">
            <AlertCircle size={40} className="mb-2" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {!loading && !isAuthenticated && !error && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
            <Lock className="text-blue-500" size={20} />
            <p className="text-sm text-blue-700 dark:text-blue-200">
              <span className="font-bold">Progress not saving?</span> Log in to track your DSA journey.
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             
             {/* FILTER TABS */}
             <div className="flex items-center gap-2 p-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                <Filter size={16} className="text-slate-400 mr-2" />
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filter === f 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
             </div>

             <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-12">#</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-16">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Problem</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Platform</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Difficulty</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredProblems.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No problems found for this filter.
                     </td>
                   </tr>
                ) : (
                  filteredProblems.map((problem, index) => {
                    const isSolved = solvedProblems.includes(problem.id.toString());
                    const platform = getPlatform(problem.link);
                    
                    return (
                      <tr 
                        key={problem.id} 
                        className={`group transition-all duration-200 ${isSolved ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                      >
                        {/* Number Column */}
                        <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                          {index + 1}
                        </td>

                        <td className="px-6 py-4">
                          <button 
                            onClick={() => toggleProblem(problem.id)}
                            disabled={!isAuthenticated}
                            className={`flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                              !isAuthenticated ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                            } ${
                              isSolved 
                                ? 'bg-blue-500 border-blue-500 text-white scale-110 shadow-md shadow-blue-500/20' 
                                : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-blue-400'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        
                        <td className="px-6 py-4">
                          <a 
                            href={problem.link} 
                            target="_blank" 
                            rel="noreferrer"
                            className={`font-medium transition-colors ${
                              isSolved 
                                ? 'text-slate-500 line-through decoration-slate-400' 
                                : 'text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                          >
                            {problem.title}
                          </a>
                          
                          {/* Mobile Only Metadata */}
                          <div className="sm:hidden mt-2 flex gap-2">
                             <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${platform.color}`}>{platform.name}</span>
                             <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium 
                               ${problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' : 
                                 problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                                 'bg-rose-100 text-rose-700'}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                        </td>

                        {/* Platform Column */}
                        <td className="px-6 py-4 hidden sm:table-cell">
                           <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${platform.color}`}>
                              <Globe size={10} className="mr-1"/> {platform.name}
                           </span>
                        </td>
                        
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border 
                            ${problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                              problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                              'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                             {problem.solutionLink && (
                                <a href={problem.solutionLink} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors" title="Solution">
                                  <FileText size={16} />
                                </a>
                             )}
                             {problem.codeLink && (
                                <a href={problem.codeLink} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Code">
                                  <Code2 size={16} />
                                </a>
                             )}
                             <a href={problem.link} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Solve">
                                <ExternalLink size={16} />
                             </a>
                           </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

// --- Helper Component for Stats ---
const StatBadge = ({ label, solved, total, color }: { label: string, solved: number, total: number, color: string }) => (
  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase mb-1">{label}</div>
    <div className="flex items-end justify-between">
      <div className="text-lg font-bold text-slate-900 dark:text-white">
        {solved} <span className="text-sm text-slate-400 font-normal">/ {total}</span>
      </div>
      <div className={`w-2 h-2 rounded-full ${color} animate-pulse`}></div>
    </div>
    <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${total > 0 ? (solved / total) * 100 : 0}%` }} />
    </div>
  </div>
);

export default TopicPage;