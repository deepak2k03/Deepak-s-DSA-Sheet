import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Code, FileText, BookOpen } from 'lucide-react';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

interface Problem {
  id: number;
  title: string;
  link: string;
  solutionLink: string;
  codeLink: string;
}

const problems: Problem[] = [
  {
    id: 1,
    title: "Learn C++",
    link: 'https://leetcode.com/problems/hello-world/',
    solutionLink: 'https://github.com/solutions/hello-world',
    codeLink: 'https://github.com/code/hello-world'
  },
  {
    id: 2,
    title: "Patterns",
    link: 'https://leetcode.com/problems/variables-data-types/',
    solutionLink: 'https://github.com/solutions/variables',
    codeLink: 'https://github.com/code/variables'
  },
  {
    id: 3,
    title: "STL",
    link: 'https://leetcode.com/problems/basic-io/',
    solutionLink: 'https://github.com/solutions/basic-io',
    codeLink: 'https://github.com/code/basic-io'
  },
  {
    id: 4,
    title: "Basic Maths",
    link: 'https://leetcode.com/problems/conditional-statements/',
    solutionLink: 'https://github.com/solutions/conditionals',
    codeLink: 'https://github.com/code/conditionals'
  },
  {
    id: 5,
    title: "Basic Recursion",
    link: 'https://leetcode.com/problems/loops/',
    solutionLink: 'https://github.com/solutions/loops',
    codeLink: 'https://github.com/code/loops'
  },
];

const BasicsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 relative">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Topics</span>
          </Link>
          
          <div className="text-center mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-300 dark:via-white dark:to-blue-300 bg-clip-text text-transparent">
                Basics
              </h1>
              <a
                href="https://github.com/notes/basics"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 dark:from-amber-600/20 dark:to-yellow-600/20 text-amber-700 dark:text-amber-200 hover:from-amber-500/30 hover:to-yellow-500/30 dark:hover:from-amber-600/30 dark:hover:to-yellow-600/30 transition-all duration-200 rounded-lg border border-amber-300 dark:border-amber-400/30 hover:border-amber-400 dark:hover:border-amber-400/50 shadow-lg"
              >
                <BookOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Notes</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <p className="text-gray-700 dark:text-blue-200 text-lg max-w-2xl mx-auto">
              Master the fundamentals with these carefully curated problems
            </p>
            <div className="mt-6 inline-flex items-center space-x-2 bg-white/70 dark:bg-blue-800/30 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-200 dark:border-blue-400/20 shadow-lg">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-gray-800 dark:text-white font-medium">{problems.length} Problems Available</span>
            </div>
          </div>
        </div>

        {/* Problems Table */}
        <div className="bg-white/90 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-blue-400/20 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-800/50 dark:to-slate-800/50 px-6 py-4 border-b border-gray-200 dark:border-blue-400/20">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Practice Problems</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/70">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-blue-200 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-blue-200 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-blue-200 uppercase tracking-wider">
                    Solution
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-blue-200 uppercase tracking-wider">
                    Code
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-blue-400/10">
                {problems.map((problem, index) => (
                  <tr 
                    key={problem.id} 
                    className="hover:bg-blue-50 dark:hover:bg-blue-800/20 transition-all duration-300 group animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-600/20 rounded-lg border border-blue-200 dark:border-blue-400/30">
                        <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm">{problem.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <a 
                        href={problem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-medium flex items-center space-x-3 group-hover:translate-x-1 transition-transform duration-200"
                      >
                        <span className="text-lg">{problem.title}</span>
                        <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <a 
                        href={problem.solutionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-600/20 dark:to-blue-600/20 text-purple-700 dark:text-purple-200 hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-600/30 dark:hover:to-blue-600/30 transition-all duration-200 rounded-lg border border-purple-200 dark:border-purple-400/30 hover:border-purple-300 dark:hover:border-purple-400/50 group shadow-md"
                      >
                        <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Solution</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <a 
                        href={problem.codeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-600/20 dark:to-emerald-600/20 text-green-700 dark:text-green-200 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-600/30 dark:hover:to-emerald-600/30 transition-all duration-200 rounded-lg border border-green-200 dark:border-green-400/30 hover:border-green-300 dark:hover:border-green-400/50 group shadow-md"
                      >
                        <Code className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Code</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-4 bg-white/70 dark:bg-slate-800/30 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 dark:border-blue-400/20 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
              <span className="text-gray-700 dark:text-green-200 text-sm">Solutions Available</span>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-blue-400/30"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
              <span className="text-gray-700 dark:text-purple-200 text-sm">Code Examples</span>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-blue-400/30"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full"></div>
              <span className="text-gray-700 dark:text-amber-200 text-sm">Notes Available</span>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BasicsPage;