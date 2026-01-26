import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, Loader2 } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import { topics } from '../data/topics';

// Define the structure of problem data we need for counting
interface ProblemData {
  topic: string;
}

const TopicsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  
  // ✅ NEW: State to store real counts from DB
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';
  // ✅ NEW: Fetch all problems to calculate counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch(`${API_URL}/problems/all`);
        if (res.ok) {
          const allProblems: ProblemData[] = await res.json();
          
          // Count problems per topic
          const counts: Record<string, number> = {};
          
          allProblems.forEach(p => {
            // Normalize topic string to match slug (lowercase, trim)
            const key = p.topic.toLowerCase().trim();
            counts[key] = (counts[key] || 0) + 1;
          });
          
          setTopicCounts(counts);
        }
      } catch (err) {
        console.error("Failed to fetch problem counts", err);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchCounts();
  }, []);

  // Filter Logic
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty ? topic.difficulty === selectedDifficulty : true;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'Easy': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'Medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'Hard': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <AnimatedBackground />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* HERO SECTION */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Explore Topics
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            A complete catalog of data structures and algorithms patterns. 
            Select a topic to start practicing.
          </p>
        </div>

        {/* CONTROLS (Search & Filter) */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search topics (e.g. 'Trees', 'Arrays')..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white shadow-sm transition-all"
            />
          </div>

          {/* Difficulty Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
                  selectedDifficulty === diff 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-500'
                }`}
              >
                {diff}
              </button>
            ))}
            {selectedDifficulty && (
              <button 
                onClick={() => setSelectedDifficulty(null)}
                className="px-3 py-2 text-sm text-slate-500 hover:text-rose-500"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* TOPICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTopics.map((topic, index) => {
             // ✅ GET REAL COUNT FROM DB (Default to 0)
             const realCount = topicCounts[topic.slug] || 0;

             return (
                <Link 
                  key={topic.slug} 
                  to={`/topic/${topic.slug}`}
                  className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      {topic.icon}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(topic.difficulty)}`}>
                      {topic.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {topic.name}
                  </h3>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">
                    {topic.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm font-medium pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 flex items-center gap-2">
                      {loadingCounts ? (
                        <span className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse block"></span>
                      ) : (
                        `${realCount} Problems`
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                      Start <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
            );
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <Filter className="text-slate-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No topics found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TopicsPage;