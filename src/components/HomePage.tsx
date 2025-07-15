import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  Network, 
  TreePine, 
  Shuffle, 
  Search, 
  Hash, 
  Zap, 
  ArrowRight,
  Code2,
  BarChart3,
  Grid3X3,
  GitBranch,
  Layers,
  Target,
  BookOpen,
  Binary,
  MousePointer,
  FileText,
  Cpu
} from 'lucide-react';
import Footer from './Footer';
import AnimatedBackground from './AnimatedBackground';

interface DSATopic {
  name: string;
  slug: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  problemCount: number;
}

const dsaTopics: DSATopic[] = [
  {
    name: 'Basics',
    slug: 'basics',
    description: 'Fundamental programming concepts and problem-solving techniques',
    icon: <BookOpen className="h-6 w-6" />,
    color: 'from-slate-500 to-slate-600',
    problemCount: 25
  },
  {
    name: 'Sorting',
    slug: 'sorting',
    description: 'Efficient algorithms for ordering and arranging elements',
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'from-blue-500 to-blue-600',
    problemCount: 28
  },
  {
    name: 'Arrays',
    slug: 'arrays',
    description: 'Master array manipulation, indexing, and traversal techniques',
    icon: <Grid3X3 className="h-6 w-6" />,
    color: 'from-emerald-500 to-emerald-600',
    problemCount: 45
  },
  {
    name: 'Binary Search',
    slug: 'binary-search',
    description: 'Divide and conquer search algorithm for sorted arrays',
    icon: <Search className="h-6 w-6" />,
    color: 'from-purple-500 to-purple-600',
    problemCount: 32
  },
  {
    name: 'Strings',
    slug: 'strings',
    description: 'String processing, pattern matching, and manipulation',
    icon: <Code2 className="h-6 w-6" />,
    color: 'from-orange-500 to-orange-600',
    problemCount: 38
  },
  {
    name: 'Linked Lists',
    slug: 'linked-lists',
    description: 'Linear data structures with dynamic memory allocation',
    icon: <GitBranch className="h-6 w-6" />,
    color: 'from-green-500 to-green-600',
    problemCount: 30
  },
  {
    name: 'Recursion',
    slug: 'recursion',
    description: 'Function calls itself to solve smaller subproblems',
    icon: <Shuffle className="h-6 w-6" />,
    color: 'from-cyan-500 to-cyan-600',
    problemCount: 26
  },
  {
    name: 'Backtracking',
    slug: 'backtracking',
    description: 'Systematic method for solving constraint satisfaction problems',
    icon: <Zap className="h-6 w-6" />,
    color: 'from-rose-500 to-rose-600',
    problemCount: 22
  },
  {
    name: 'Bit Manipulation',
    slug: 'bit-manipulation',
    description: 'Operations on individual bits and binary representations',
    icon: <Binary className="h-6 w-6" />,
    color: 'from-indigo-500 to-indigo-600',
    problemCount: 18
  },
  {
    name: 'Stacks and Queues',
    slug: 'stacks-queues',
    description: 'LIFO and FIFO data structures and their applications',
    icon: <Layers className="h-6 w-6" />,
    color: 'from-teal-500 to-teal-600',
    problemCount: 28
  },
  {
    name: 'Sliding Windows and Two Pointers',
    slug: 'sliding-windows-two-pointers',
    description: 'Efficient techniques for array and string problems',
    icon: <MousePointer className="h-6 w-6" />,
    color: 'from-amber-500 to-amber-600',
    problemCount: 35
  },
  {
    name: 'Heaps',
    slug: 'heaps',
    description: 'Priority queues and heap-based algorithms',
    icon: <Database className="h-6 w-6" />,
    color: 'from-red-500 to-red-600',
    problemCount: 24
  },
  {
    name: 'Greedy',
    slug: 'greedy',
    description: 'Make locally optimal choices for global optimization',
    icon: <Target className="h-6 w-6" />,
    color: 'from-violet-500 to-violet-600',
    problemCount: 29
  },
  {
    name: 'Trees',
    slug: 'trees',
    description: 'Binary trees, BSTs, and tree traversal algorithms',
    icon: <TreePine className="h-6 w-6" />,
    color: 'from-pink-500 to-pink-600',
    problemCount: 42
  },
  {
    name: 'Graphs',
    slug: 'graphs',
    description: 'Graph theory, traversals, and shortest path algorithms',
    icon: <Network className="h-6 w-6" />,
    color: 'from-lime-500 to-lime-600',
    problemCount: 38
  },
  {
    name: 'Dynamic Programming',
    slug: 'dynamic-programming',
    description: 'Optimization technique using memoization and tabulation',
    icon: <Cpu className="h-6 w-6" />,
    color: 'from-sky-500 to-sky-600',
    problemCount: 45
  },
  {
    name: 'Tries',
    slug: 'tries',
    description: 'Tree-like data structure for efficient string operations',
    icon: <Hash className="h-6 w-6" />,
    color: 'from-fuchsia-500 to-fuchsia-600',
    problemCount: 16
  },
  {
    name: 'Segment Trees',
    slug: 'segment-trees',
    description: 'Advanced tree structure for range queries and updates',
    icon: <FileText className="h-6 w-6" />,
    color: 'from-emerald-600 to-teal-600',
    problemCount: 14
  }
];

const HomePage: React.FC = () => {
  const totalProblems = dsaTopics.reduce((sum, topic) => sum + topic.problemCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 relative">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-300 dark:via-white dark:to-blue-300 bg-clip-text text-transparent mb-6 animate-pulse">
            Deepak's Sheet
          </h1>
          <p className="text-xl text-gray-700 dark:text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
            Master Data Structures and Algorithms with our comprehensive collection of problems. 
            Practice, learn, and excel in your coding interviews.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center space-x-2 bg-white/70 dark:bg-blue-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 dark:border-blue-400/30 shadow-lg">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-gray-700 dark:text-blue-200 font-medium">18 Topics</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/70 dark:bg-blue-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200 dark:border-blue-400/30 shadow-lg">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-700 dark:text-green-200 font-medium">{totalProblems}+ Problems</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/70 dark:bg-blue-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200 dark:border-blue-400/30 shadow-lg">
              <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-gray-700 dark:text-purple-200 font-medium">Solutions Included</span>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dsaTopics.map((topic, index) => (
            <Link
              key={topic.slug}
              to={`/topic/${topic.slug}`}
              className="group block animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-blue-400/20 rounded-xl p-6 hover:bg-white/90 dark:hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-blue-500/25 hover:border-blue-300 dark:hover:border-blue-400/40 shadow-lg">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${topic.color} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  {topic.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                  {topic.name}
                </h3>
                
                <p className="text-gray-600 dark:text-blue-200 text-sm mb-4 leading-relaxed">
                  {topic.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-400/30 px-3 py-1 rounded-full text-blue-700 dark:text-blue-200 font-medium">
                    {topic.problemCount} problems
                  </span>
                  <ArrowRight className="h-4 w-4 text-blue-500 dark:text-blue-300 group-hover:text-blue-700 dark:group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white/80 dark:bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-blue-400/20 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-2">{totalProblems}+</div>
              <div className="text-gray-600 dark:text-blue-200">Practice Problems</div>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent mb-2">18</div>
              <div className="text-gray-600 dark:text-purple-200">Core Topics</div>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent mb-2">100%</div>
              <div className="text-gray-600 dark:text-green-200">Free Access</div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HomePage;