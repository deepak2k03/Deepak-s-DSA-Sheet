import React from 'react';
import { 
  BookOpen, Grid3X3, Code2, Search, Shuffle, GitBranch, BarChart3, 
  Binary, Layers, MousePointer, Database, Target, TreePine, Network, 
  Cpu, Hash, FileText, Zap 
} from 'lucide-react';

export const topics = [
  { name: 'Basics', slug: 'basics', description: 'Loops, control flow & logic.', icon: <BookOpen size={20} />, problemCount: 25, difficulty: 'Easy' },
  { name: 'Arrays', slug: 'arrays', description: 'Matrices & sliding windows.', icon: <Grid3X3 size={20} />, problemCount: 45, difficulty: 'Easy' },
  { name: 'Strings', slug: 'strings', description: 'Pattern matching & parsing.', icon: <Code2 size={20} />, problemCount: 38, difficulty: 'Medium' },
  { name: 'Binary Search', slug: 'binary-search', description: 'O(log n) optimization.', icon: <Search size={20} />, problemCount: 32, difficulty: 'Medium' },
  { name: 'Recursion', slug: 'recursion', description: 'Solving sub-problems.', icon: <Shuffle size={20} />, problemCount: 26, difficulty: 'Medium' },
  { name: 'Linked Lists', slug: 'linked-lists', description: 'Pointer manipulation.', icon: <GitBranch size={20} />, problemCount: 30, difficulty: 'Easy' },
  { name: 'Sorting', slug: 'sorting', description: 'Merge, Quick & Heap sort.', icon: <BarChart3 size={20} />, problemCount: 28, difficulty: 'Medium' },
  { name: 'Bit Manipulation', slug: 'bit-manipulation', description: 'XOR, shifts & masks.', icon: <Binary size={20} />, problemCount: 18, difficulty: 'Hard' },
  { name: 'Stacks & Queues', slug: 'stacks-queues', description: 'LIFO/FIFO operations.', icon: <Layers size={20} />, problemCount: 28, difficulty: 'Medium' },
  { name: 'Trees', slug: 'trees', description: 'DFS, BFS & traversals.', icon: <TreePine size={20} />, problemCount: 42, difficulty: 'Medium' },
  { name: 'Graphs', slug: 'graphs', description: 'Shortest paths & cycles.', icon: <Network size={20} />, problemCount: 38, difficulty: 'Hard' },
  { name: 'DP', slug: 'dynamic-programming', description: 'Memoization & tabulation.', icon: <Cpu size={20} />, problemCount: 45, difficulty: 'Hard' },
  { name: 'Backtracking', slug: 'backtracking', description: 'Constraint satisfaction.', icon: <Zap size={20} />, problemCount: 22, difficulty: 'Hard' },
  { name: 'Greedy', slug: 'greedy', description: 'Local optimization.', icon: <Target size={20} />, problemCount: 29, difficulty: 'Medium' },
  { name: 'Heaps', slug: 'heaps', description: 'Priority queues.', icon: <Database size={20} />, problemCount: 24, difficulty: 'Medium' },
  { name: 'Tries', slug: 'tries', description: 'Prefix trees.', icon: <Hash size={20} />, problemCount: 16, difficulty: 'Hard' },
  { name: 'Segment Trees', slug: 'segment-trees', description: 'Range queries.', icon: <FileText size={20} />, problemCount: 14, difficulty: 'Hard' },
  { name: 'Two Pointers', slug: 'two-pointers', description: 'In-place array ops.', icon: <MousePointer size={20} />, problemCount: 35, difficulty: 'Medium' },
];