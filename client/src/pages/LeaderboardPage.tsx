import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, User, Search } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';

interface LeaderboardUser {
  username: string;
  solvedCount: number;
}

const LeaderboardPage: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Leaderboard Data
        const res = await fetch('http://localhost:5000/api/auth/leaderboard');
        const data = await res.json();
        if (res.ok) setUsers(data);

        // 2. Check who is currently logged in (to highlight them)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setCurrentUser(parsed.username);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to get rank icon
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="text-yellow-500 fill-yellow-500" size={24} />;
      case 1: return <Medal className="text-slate-400 fill-slate-400" size={24} />;
      case 2: return <Medal className="text-amber-700 fill-amber-700" size={24} />;
      default: return <span className="font-bold text-slate-500 w-6 text-center">{index + 1}</span>;
    }
  };

  // Helper to get row style
  const getRowStyle = (index: number) => {
    switch (index) {
      case 0: return "bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30";
      case 1: return "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800";
      case 2: return "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30";
      default: return "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <AnimatedBackground />

      <main className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
            <Trophy size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Top performers in the DSA community. Keep solving to rise up!
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Table Header */}
            <div className="flex items-center px-6 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <div className="w-16 text-center">Rank</div>
              <div className="flex-1">User</div>
              <div className="w-24 text-right">Solved</div>
            </div>

            {/* List */}
            {users.map((user, index) => (
              <div 
                key={user.username}
                className={`flex items-center px-6 py-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${getRowStyle(index)} ${
                  user.username === currentUser ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950' : ''
                }`}
              >
                {/* Rank */}
                <div className="w-16 flex justify-center">
                  {getRankIcon(index)}
                </div>

                {/* User Info */}
                <div className="flex-1 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                    index === 0 ? 'bg-gradient-to-tr from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-tr from-slate-400 to-slate-600' :
                    index === 2 ? 'bg-gradient-to-tr from-amber-600 to-amber-800' :
                    'bg-gradient-to-tr from-blue-500 to-purple-500'
                  }`}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {user.username} 
                      {user.username === currentUser && (
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">You</span>
                      )}
                    </h3>
                  </div>
                </div>

                {/* Solved Count */}
                <div className="w-24 text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 shadow-sm">
                    {user.solvedCount} <span className="text-[10px] text-slate-400 font-normal uppercase">Qs</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LeaderboardPage;