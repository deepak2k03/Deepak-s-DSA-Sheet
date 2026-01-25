import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, ArrowRight, ExternalLink, 
  Code2, FileText, Loader2, Sparkles 
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';

interface Problem {
  id: number;
  title: string;
  link: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  solutionLink?: string;
  codeLink?: string;
}

const POTDPage: React.FC = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  // 1. Fetch POTD
  useEffect(() => {
    const fetchPOTD = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/problems/potd');
        const data = await res.json();
        setProblem(data);
      } catch (err) {
        console.error("Failed to fetch POTD", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPOTD();
  }, []);

  // 2. Countdown Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Target: Tomorrow at 00:00:00
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();

      if (diff <= 0) {
        // Optional: Trigger a refresh if time hits 0
        setTimeLeft("00:00:00");
      } else {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        
        setTimeLeft(
          `${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'Easy': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'Medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
      case 'Hard': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <AnimatedBackground />

      <main className="relative max-w-4xl mx-auto px-4 py-20">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider text-xs mb-6">
            <Sparkles size={14} /> Daily Challenge
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6">
            Problem of the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Day</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Consistency is key. Solve one new problem every day to build your streak and master new patterns.
          </p>
        </div>

        {/* Timer Card */}
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-8 py-4 shadow-xl flex items-center gap-6">
             <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Remaining</p>
                <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {timeLeft}
                </p>
             </div>
             <div className="h-10 w-px bg-slate-200 dark:bg-slate-800"></div>
             <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <Clock className="text-purple-500 animate-pulse" />
                <span className="text-sm font-medium">Resets at Midnight</span>
             </div>
          </div>
        </div>

        {/* Problem Card */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          </div>
        ) : problem ? (
          <div className="relative group bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-500">
            
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-500"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                   <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
                        <Calendar size={14}/> {new Date().toLocaleDateString()}
                      </span>
                   </div>
                   <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                     {problem.title}
                   </h2>
                   <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                     Topic: <span className="text-slate-900 dark:text-slate-200 capitalize">{problem.topic}</span>
                   </p>
                </div>

                <a 
                  href={problem.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-purple-500/20"
                >
                  Solve Now <ExternalLink size={18} className="ml-2"/>
                </a>
              </div>

              <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-8"></div>

              <div className="flex gap-4">
                 {problem.solutionLink && (
                   <a href={problem.solutionLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-purple-500 transition-colors">
                      <FileText size={18} /> View Solution
                   </a>
                 )}
                 {problem.codeLink && (
                   <a href={problem.codeLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-purple-500 transition-colors">
                      <Code2 size={18} /> View Code
                   </a>
                 )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            No problem found for today. Check database connection.
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default POTDPage;