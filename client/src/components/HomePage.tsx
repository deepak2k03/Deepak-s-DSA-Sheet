import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Terminal, Cpu, Globe, Zap, 
  Layers, Code2, Trophy, Activity, CheckCircle2,
  Play, Command, Hash
} from 'lucide-react';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import { topics } from '../data/topics'; // Import local topics data for counting

// --- PRO COMPONENTS ---

// 1. The "Live" Code Editor
const CodeEditorSimulation = () => {
  const [code, setCode] = useState('');
  const fullCode = `class Solution {
  public:
    void solve() {
      // Mastering DSA
      vector<int> path;
      dfs(root, path);
      return "Success";
    }
};`;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setCode(fullCode.slice(0, i));
      i++;
      if (i > fullCode.length) {
        // Pause at the end then reset
        setTimeout(() => { i = 0; }, 2000); 
      }
    }, 50); // Typing speed
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#0F1117] border border-slate-800 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1A1D26] border-b border-slate-800">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
          <Code2 size={12} /> solution.cpp
        </div>
        <div className="w-10" /> 
      </div>
      
      {/* Code Area */}
      <div className="p-6 h-64 font-mono text-sm leading-relaxed overflow-hidden text-slate-300">
        <pre className="whitespace-pre-wrap">
          <span className="text-purple-400">class</span> <span className="text-yellow-200">Solution</span> {'{'}{'\n'}
          <span className="text-purple-400">  public:</span>{'\n'}
          <span className="text-purple-400">    void</span> <span className="text-blue-400">solve</span>() {'{'}{'\n'}
          <span className="text-slate-500">      // Mastering DSA</span>{'\n'}
              {code}
              <span className="animate-pulse inline-block w-2 h-4 bg-blue-500 ml-1 align-middle"></span>
          {'\n'}{'    }'}{'\n'}{'};'}
        </pre>
      </div>

      {/* Floating Badge */}
      <div className="absolute bottom-4 right-4 bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
        <CheckCircle2 size={12} /> Accepted
      </div>
    </div>
  );
};

// 2. Moving Grid Background
const MovingGrid = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
  </div>
);

const HomePage: React.FC = () => {
  // ✅ STATE FOR REAL-TIME STATS
  const [stats, setStats] = useState({
    totalProblems: 0,
    activeUsers: 0,
    topicsCount: 0,
    totalSolves: 0
  });

  // ✅ FETCH REAL DATA
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Fetch Problem Count
        const probRes = await fetch('http://localhost:5000/api/problems/all');
        const probData = await probRes.json();
        const probCount = Array.isArray(probData) ? probData.length : 0;

        // 2. Fetch User Count & Total Solves
        const userRes = await fetch('http://localhost:5000/api/auth/leaderboard');
        const userData = await userRes.json();
        const userCount = Array.isArray(userData) ? userData.length : 0;
        
        // Calculate sum of all solved problems across all users
        const solvesCount = Array.isArray(userData) 
          ? userData.reduce((acc: number, user: any) => acc + user.solvedCount, 0)
          : 0;

        setStats({
          totalProblems: probCount,
          activeUsers: userCount,
          topicsCount: topics.length, // From local data
          totalSolves: solvesCount
        });

      } catch (err) {
        console.error("Error fetching homepage stats:", err);
        // Fallback for visual stability if backend is down
        setStats({ totalProblems: 450, activeUsers: 0, topicsCount: topics.length, totalSolves: 0 });
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="relative min-h-screen font-sans bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30">
      
      {/* Background Layers */}
      <MovingGrid />
      <AnimatedBackground />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-16 pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wide mb-8 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                The v2.0 Platform is Live
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x">
                  DEEPAK'S  <br/>
                </span>
                DSA Sheet <br />
              </h1>

              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Stop grinding aimlessly. Access a curated roadmap of <strong>450+ patterns</strong>, track your streaks, and visualize your growth with world-class analytics.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link 
                  to="/topics" 
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-white text-slate-900 font-bold text-lg hover:bg-slate-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-95 flex items-center justify-center gap-2"
                >
                  <Play size={20} className="fill-current" /> Start Solving
                </Link>
                <Link 
                  to="/leaderboard" 
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 backdrop-blur-md text-slate-900 dark:text-white font-semibold text-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <Trophy size={20} className="text-yellow-500" /> Leaderboard
                </Link>
              </div>

              {/* Trust Badge */}
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
                <div className="flex -space-x-2">
                   {[1,2,3,4].map(i => (
                     <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-[#020617] bg-slate-200 dark:bg-slate-800 z-${10-i}`} />
                   ))}
                </div>
                <div>Joined by {stats.activeUsers}+ developers</div>
              </div>
            </div>

            {/* Right Visual (The Code Window) */}
            <div className="relative hidden lg:block perspective-1000">
               {/* Background Glow */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
               
               {/* Floating Elements */}
               <div className="absolute -top-10 -right-10 bg-[#1e293b] p-4 rounded-2xl border border-slate-700 shadow-xl z-20 animate-float-slow">
                 <Terminal className="text-blue-400" size={32} />
               </div>
               <div className="absolute -bottom-10 -left-10 bg-[#1e293b] p-4 rounded-2xl border border-slate-700 shadow-xl z-20 animate-float-medium">
                 <Cpu className="text-purple-400" size={32} />
               </div>

               <CodeEditorSimulation />
            </div>

          </div>
        </div>
      </section>

      {/* --- STATS SECTION (Dynamic Bento Grid) --- */}
      <section className="py-10 border-y border-slate-200 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Total Problems', value: stats.totalProblems, icon: <Hash className="text-blue-500"/> },
                { label: 'Active Users', value: stats.activeUsers, icon: <Activity className="text-green-500"/> },
                { label: 'Topics', value: stats.topicsCount, icon: <Layers className="text-purple-500"/> },
                { label: 'Global Solves', value: stats.totalSolves, icon: <Zap className="text-yellow-500"/> },
              ].map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center p-4 group cursor-default">
                   <div className="mb-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                   <div className="text-3xl font-bold text-slate-900 dark:text-white animate-fade-in">
                      {stat.value}
                   </div>
                   <div className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
             <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
               Everything you need <br />
               <span className="text-slate-400">to ace the interview.</span>
             </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Curated Roadmap"
              desc="No more random solving. Follow a structured path from Arrays to Advanced Graphs designed by industry experts."
              icon={<Command size={32} className="text-white"/>}
              gradient="from-blue-500 to-cyan-500"
            />
             <FeatureCard 
              title="Progress Analytics"
              desc="Visualise your consistency with heatmaps and charts. We track your streaks so you stay motivated."
              icon={<Activity size={32} className="text-white"/>}
              gradient="from-purple-500 to-pink-500"
            />
             <FeatureCard 
              title="Global Leaderboard"
              desc="Compete with thousands of developers worldwide. Earn badges and climb the ranks to prove your skills."
              icon={<Globe size={32} className="text-white"/>}
              gradient="from-orange-500 to-red-500"
            />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 -z-10"></div>
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)]"></div>

        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
            Ready to change your career?
          </h2>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            Join the community of developers who have cracked FAANG interviews using our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link 
              to="/topics" 
              className="px-10 py-4 bg-white text-indigo-900 font-bold rounded-full hover:bg-indigo-50 transition-all shadow-lg hover:shadow-indigo-500/20 hover:scale-105"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* --- CSS FOR ANIMATIONS --- */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const FeatureCard = ({ title, desc, icon, gradient }: { title: string, desc: string, icon: React.ReactNode, gradient: string }) => (
  <div className="group relative p-8 rounded-3xl bg-slate-50 dark:bg-[#0F1117] border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
    {/* Hover Glow */}
    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
    
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
      {desc}
    </p>
    
    <div className="mt-6 flex items-center text-sm font-semibold text-slate-900 dark:text-white group-hover:translate-x-2 transition-transform">
      Learn more <ArrowRight size={14} className="ml-1" />
    </div>
  </div>
);

export default HomePage;