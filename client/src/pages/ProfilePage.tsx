import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Trophy, Target, Zap, 
  TrendingUp, Activity, PieChart, Calendar 
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';

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
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // 1. Fetch User Data
        const userRes = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'x-auth-token': token }
        });
        const userData = await userRes.json();

        // 2. Fetch ALL Problems (to calculate totals)
        const probRes = await fetch('http://localhost:5000/api/problems/all');
        const probData = await probRes.json();

        if (userRes.ok) setUser(userData);
        if (probRes.ok) setAllProblems(probData);

      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
      Loading profile...
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
      Please log in to view your profile.
    </div>
  );

  // --- STATS CALCULATION ---
  const totalSolved = user.solvedProblems.length;
  const totalQuestions = allProblems.length;
  
  // Difficulty Counts
  const easyTotal = allProblems.filter(p => p.difficulty === 'Easy').length;
  const medTotal = allProblems.filter(p => p.difficulty === 'Medium').length;
  const hardTotal = allProblems.filter(p => p.difficulty === 'Hard').length;

  const easySolved = allProblems.filter(p => p.difficulty === 'Easy' && user.solvedProblems.includes(String(p.id))).length;
  const medSolved = allProblems.filter(p => p.difficulty === 'Medium' && user.solvedProblems.includes(String(p.id))).length;
  const hardSolved = allProblems.filter(p => p.difficulty === 'Hard' && user.solvedProblems.includes(String(p.id))).length;

  // Topic Breakdown
  const topics = Array.from(new Set(allProblems.map(p => p.topic)));
  const topicStats = topics.map(topic => {
    const topicProblems = allProblems.filter(p => p.topic === topic);
    const solvedInTopic = topicProblems.filter(p => user.solvedProblems.includes(String(p.id))).length;
    return { name: topic, total: topicProblems.length, solved: solvedInTopic };
  }).sort((a, b) => b.solved - a.solved); // Sort by most solved

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <AnimatedBackground />

      <main className="max-w-6xl mx-auto px-4 py-12">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-4xl text-white font-bold shadow-lg shadow-blue-500/30 z-10">
            {user.username.charAt(0).toUpperCase()}
          </div>
          
          <div className="text-center md:text-left z-10 flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {user.username}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-slate-500 dark:text-slate-400 text-sm">
              <span className="flex items-center gap-1"><Mail size={14}/> {user.email}</span>
              <span className="flex items-center gap-1"><Calendar size={14}/> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex gap-4 z-10">
             <div className="text-center px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalSolved}</div>
                <div className="text-xs text-slate-500 uppercase font-semibold">Solved</div>
             </div>
             <div className="text-center px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalQuestions}</div>
                <div className="text-xs text-slate-500 uppercase font-semibold">Total</div>
             </div>
          </div>
        </div>

        {/* DIFFICULTY STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* EASY CARD */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold">Easy</span>
              <span className="text-slate-400 text-xs">{easySolved} / {easyTotal}</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {easyTotal > 0 ? Math.round((easySolved / easyTotal) * 100) : 0}%
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(easySolved/easyTotal)*100}%` }}></div>
            </div>
          </div>

          {/* MEDIUM CARD */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-amber-600 bg-amber-100 dark:bg-amber-500/10 px-3 py-1 rounded-full text-xs font-bold">Medium</span>
              <span className="text-slate-400 text-xs">{medSolved} / {medTotal}</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {medTotal > 0 ? Math.round((medSolved / medTotal) * 100) : 0}%
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${(medSolved/medTotal)*100}%` }}></div>
            </div>
          </div>

          {/* HARD CARD */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-rose-600 bg-rose-100 dark:bg-rose-500/10 px-3 py-1 rounded-full text-xs font-bold">Hard</span>
              <span className="text-slate-400 text-xs">{hardSolved} / {hardTotal}</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {hardTotal > 0 ? Math.round((hardSolved / hardTotal) * 100) : 0}%
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${(hardSolved/hardTotal)*100}%` }}></div>
            </div>
          </div>
        </div>

        {/* TOPIC BREAKDOWN */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart size={20} className="text-blue-500"/> Topic Breakdown
            </h3>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topicStats.map((topic) => (
              <div key={topic.name} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-slate-700 dark:text-slate-200 capitalize">{topic.name}</span>
                  <span className="text-sm text-slate-500">
                    <span className="font-bold text-slate-900 dark:text-white">{topic.solved}</span> / {topic.total}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${(topic.solved / topic.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}

            {topicStats.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                No data available. Start solving problems to see your stats!
              </div>
            )}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;