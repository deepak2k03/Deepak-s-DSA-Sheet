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
    title: "Array To Linked List",
    link: 'https://www.geeksforgeeks.org/problems/introduction-to-linked-list/1',
    solutionLink: 'https://github.com/solutions/reverse-linked-list',
    codeLink: 'https://github.com/code/reverse-linked-list'
  },
  {
    id: 2,
    title: "Traversing a Linked List",
    link: 'https://www.geeksforgeeks.org/problems/print-linked-list-elements/1',
    solutionLink: 'https://github.com/solutions/merge-sorted-lists',
    codeLink: 'https://github.com/code/merge-sorted-lists'
  },
  {
    id: 3,
    title: "Length of Linked List",
    link: 'https://www.geeksforgeeks.org/problems/count-nodes-of-linked-list/1',
    solutionLink: 'https://github.com/solutions/linked-list-cycle',
    codeLink: 'https://github.com/code/linked-list-cycle'
  },
  {
    id: 4,
    title: "Search Element In a Linked List",
    link: 'https://www.geeksforgeeks.org/problems/search-in-linked-list-1664434326/1',
    solutionLink: 'https://github.com/solutions/remove-nth-node',
    codeLink: 'https://github.com/code/remove-nth-node'
  },
  {
    id: 5,
    title: "Delete Head Of A Linked List.cpp",
    link: 'https://leetcode.com/problems/add-two-numbers/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 6,
    title: "Delete Tail Of A Linked List",
    link: 'https://www.tutorialspoint.com/delete-a-tail-node-from-the-given-singly-linked-list-using-cplusplus',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 7,
    title: "Delete Kth Element of A Linked List",
    link: 'https://www.geeksforgeeks.org/problems/delete-a-node-in-single-linked-list/1',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 8,
    title: "Delete Node If Actual Node is Given But Its Not the Last One",
    link: 'https://leetcode.com/problems/delete-node-in-a-linked-list/description/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 9,
    title: "Delete Element In LL By Value",
    link: 'https://stackoverflow.com/questions/13656061/delete-node-from-linked-list-with-specific-value',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 10,
    title: "Delete All Elements In a Linked List with a given value",
    link: 'https://leetcode.com/problems/remove-linked-list-elements/description/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 11,
    title: "Delete Nodes From Linked List Present In Array",
    link: 'https://leetcode.com/problems/delete-nodes-from-linked-list-present-in-array/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 12,
    title: "Insert_An_Element_At_Head_Of_A_Linked_List",
    link: 'https://www.hackerrank.com/challenges/insert-a-node-at-the-head-of-a-linked-list/problem',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 13,
    title: "Insert_An_Element_At_Tail_Of_A_Linked_List",
    link: 'https://www.geeksforgeeks.org/problems/linked-list-insertion-1587115620/1',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 14,
    title: "Insert An Element At Given Index",
    link: 'https://www.hackerrank.com/challenges/insert-a-node-at-a-specific-position-in-a-linked-list/problem',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 15,
    title: "Array to Doubly Linked List",
    link: 'https://www.geeksforgeeks.org/problems/introduction-to-doubly-linked-list/1',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 16,
    title: "Delete Head Of A DLL",
    link: 'https://www.naukri.com/code360/problems/insert-before-the-given-node-of-a-doubly-linked-list_9719100',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 17,
    title: "Delete Tail of A DLL",
    link: 'https://www.naukri.com/code360/problems/delete-last-node-of-a-doubly-linked-list_8160469',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 18,
    title: "Delete Kth Element of DLL",
    link: 'https://www.geeksforgeeks.org/problems/delete-node-in-doubly-linked-list/1',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 19,
    title: "Delete A given Node in DLL",
    link: 'https://www.geeksforgeeks.org/dsa/delete-a-node-in-a-doubly-linked-list/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 20,
    title: "Insert A Node At Given Position in DLL",
    link: 'https://www.geeksforgeeks.org/problems/insert-a-node-in-doubly-linked-list/1',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 21,
    title: "Reverse A DLL",
    link: 'https://www.geeksforgeeks.org/problems/insert-a-node-in-doubly-linked-list/1',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 22,
    title: "Middle Element of A Linked List",
    link: 'https://leetcode.com/problems/middle-of-the-linked-list/description/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 23,
    title: "Reverse A Linked List",
    link: 'https://leetcode.com/problems/reverse-linked-list/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 24,
    title: "Detect A Loop In Linked List",
    link: 'https://leetcode.com/problems/reverse-linked-list/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 25,
    title: "Find The Starting Node of A Loop In Linked List",
    link: 'https://leetcode.com/problems/reverse-linked-list/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 26,
    title: "Find Length of Loop In Linked List",
    link: 'https://www.geeksforgeeks.org/problems/find-length-of-loop/1',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 27,
    title: "Check Palindrome Linked List",
    link: 'https://leetcode.com/problems/palindrome-linked-list/description/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 28,
    title: "Segrregate Odd And Even Nodes In Linked List",
    link: 'https://leetcode.com/problems/odd-even-linked-list/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 29,
    title: "Remove Nth Node From End In Linked List",
    link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/description/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 30,
    title: "Delete The Middle Node In LL",
    link: 'https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/description/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 31,
    title: "Merge Two Sorted Lists",
    link: 'https://leetcode.com/problems/merge-two-sorted-lists/description/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 32,
    title: "Sort A Linked List",
    link: 'https://leetcode.com/problems/sort-list/description/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 33,
    title: "Merge K Sorted Lists",
    link: 'https://leetcode.com/problems/merge-k-sorted-lists/description/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 34,
    title: "Sort A LL of 0s, 1s and 2s",
    link: 'https://leetcode.com/problems/merge-k-sorted-lists/description/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 35,
    title: "Intersection of Two Linked Lists",
    link: 'https://leetcode.com/problems/intersection-of-two-linked-lists/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 36,
    title: "Add 1 to A Number Represented By LL",
    link: 'https://leetcode.com/problems/intersection-of-two-linked-lists/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  },
  {
    id: 37,
    title: "Add 2 Numbers Represented By LL",
    link: 'https://leetcode.com/problems/intersection-of-two-linked-lists/',
    solutionLink: 'https://github.com/solutions/add-two-numbers',
    codeLink: 'https://github.com/code/add-two-numbers'
  }
];

const LinkedListsPage: React.FC = () => {
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
                Linked Lists
              </h1>
              <a
                href="https://github.com/notes/linked-lists"
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
              Linear data structures with dynamic memory allocation
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

export default LinkedListsPage;