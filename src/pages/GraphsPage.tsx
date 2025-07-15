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
    title: "Graph Representation In Adjacency Matrix",
    link: 'https://www.geeksforgeeks.org/dsa/adjacency-matrix/',
    solutionLink: 'https://github.com/solutions/number-of-islands',
    codeLink: 'https://github.com/code/number-of-islands'
  },
  {
    id: 2,
    title: "Graph Representation In Adjacency List",
    link: 'https://www.geeksforgeeks.org/problems/print-adjacency-list-1587115620/1',
    solutionLink: 'https://github.com/solutions/clone-graph',
    codeLink: 'https://github.com/code/clone-graph'
  },
  {
    id: 3,
    title: "BFS of A Graph",
    link: 'https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1',
    solutionLink: 'https://github.com/solutions/course-schedule',
    codeLink: 'https://github.com/code/course-schedule'
  },
  {
    id: 4,
    title: "DFS of A Graph",
    link: 'https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1',
    solutionLink: 'https://github.com/solutions/pacific-atlantic-water-flow',
    codeLink: 'https://github.com/code/pacific-atlantic-water-flow'
  },
  {
    id: 5,
    title: "Number of Provinces",
    link: 'https://leetcode.com/problems/number-of-provinces/description/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 6,
    title: "Connected Components In A Matrix",
    link: 'https://www.geeksforgeeks.org/problems/connected-components-in-an-undirected-graph/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 7,
    title: "Rotting Oranges",
    link: 'https://leetcode.com/problems/rotting-oranges/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 8,
    title: "Flood Fill",
    link: 'https://leetcode.com/problems/flood-fill/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 9,
    title: "Cycle Detection In Undirected Graph",
    link: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 10,
    title: "01 Matrix",
    link: 'https://leetcode.com/problems/01-matrix/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 11,
    title: "Surrounded Regions",
    link: 'https://leetcode.com/problems/surrounded-regions/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 12,
    title: "Number of Enclaves",
    link: 'https://leetcode.com/problems/number-of-enclaves/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 13,
    title: "Word Ladder I",
    link: 'https://leetcode.com/problems/word-ladder/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 14,
    title: "Word Ladder II",
    link: 'https://leetcode.com/problems/word-ladder-ii/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 15,
    title: "Number of Islands",
    link: 'https://leetcode.com/problems/number-of-islands/description/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 16,
    title: "https://www.geeksforgeeks.org/problems/number-of-distinct-islands/1",
    link: 'https://leetcode.com/problems/number-of-provinces/description/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 17,
    title: "Bipartite Graph",
    link: 'https://leetcode.com/problems/is-graph-bipartite/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 18,
    title: "Cycle Detection In Directed Graph DFS",
    link: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 19,
    title: "Topological Sort",
    link: 'https://www.geeksforgeeks.org/problems/topological-sort/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 20,
    title: "Cycle Detection in Directed Graph BFS",
    link: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 21,
    title: "Cycle Detection in Directed Graph BFS",
    link: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 22,
    title: "Course Schedule I",
    link: 'https://leetcode.com/problems/course-schedule/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 23,
    title: "Course Schedule II",
    link: 'https://leetcode.com/problems/course-schedule-ii/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 24,
    title: "Find Eventual Safe States",
    link: 'https://leetcode.com/problems/course-schedule-ii/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 25,
    title: "Alien Dictionary",
    link: 'https://leetcode.com/problems/course-schedule-ii/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 26,
    title: "Shortest Path in UG with unit weights",
    link: 'https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-having-unit-distance/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 27,
    title: "Shortest Path in Weighted Directed Acyclic Graph",
    link: 'https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 27,
    title: "Shortest Path in Weighted Undirected Graph",
    link: 'https://www.geeksforgeeks.org/problems/shortest-path-in-weighted-undirected-graph/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 28,
    title: "Dijkstra's Algorithm",
    link: 'https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 29,
    title: "Dijkstra's Algorithm",
    link: 'https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 30,
    title: "Print Shortest Path",
    link: 'https://www.geeksforgeeks.org/problems/shortest-path-in-weighted-undirected-graph/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 31,
    title: "Print Shortest Path",
    link: 'https://www.geeksforgeeks.org/problems/shortest-path-in-weighted-undirected-graph/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 31,
    title: "Shortest Path in Binary Maze",
    link: 'https://www.geeksforgeeks.org/problems/shortest-path-in-a-binary-maze-1655453161/1',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 32,
    title: "Shortest Path in Binary Matrix",
    link: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/description/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 33,
    title: "Path With Minimum Effort",
    link: 'https://leetcode.com/problems/path-with-minimum-effort/description/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 34,
    title: "Cheapest Flights Within K Stops",
    link: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/description/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  },
  {
    id: 35,
    title: "Network Delay Time",
    link: 'https://leetcode.com/problems/network-delay-time/description/',
    solutionLink: 'https://github.com/solutions/network-delay-time',
    codeLink: 'https://github.com/code/network-delay-time'
  }
];

const GraphsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 relative">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Graphs
              </h1>
              <a
                href="https://github.com/notes/graphs"
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
              Graph theory, traversals, and shortest path algorithms
            </p>
            <div className="mt-6 inline-flex items-center space-x-2 bg-white/70 dark:bg-blue-800/30 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-200 dark:border-blue-400/20 shadow-lg">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-gray-800 dark:text-white font-medium">{problems.length} Problems Available</span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-blue-400/20 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-800/50 dark:to-slate-800/50 px-6 py-4 border-b border-gray-200 dark:border-blue-400/20">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Practice Problems</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/70">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-blue-200 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-blue-200 uppercase tracking-wider">Problem</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-blue-200 uppercase tracking-wider">Solution</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-blue-200 uppercase tracking-wider">Code</th>
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

export default GraphsPage;