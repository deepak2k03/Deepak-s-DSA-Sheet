import React from 'react';
import {
  BarChart3,
  Binary,
  BookOpen,
  Code2,
  Cpu,
  Database,
  FileText,
  GitBranch,
  Grid3X3,
  Hash,
  Layers,
  MousePointer,
  Network,
  Search,
  Shuffle,
  Target,
  TreePine,
  Zap,
} from 'lucide-react';

export type TopicDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface TopicDefinition {
  id?: string;
  name: string;
  slug: string;
  description: string;
  difficulty: TopicDifficulty;
  iconKey: string;
  problemCount?: number;
  order?: number;
  isActive?: boolean;
}

const iconMap = {
  'bar-chart-3': BarChart3,
  binary: Binary,
  'book-open': BookOpen,
  'code-2': Code2,
  cpu: Cpu,
  database: Database,
  'file-text': FileText,
  'git-branch': GitBranch,
  'grid-3x3': Grid3X3,
  hash: Hash,
  layers: Layers,
  'mouse-pointer': MousePointer,
  network: Network,
  search: Search,
  shuffle: Shuffle,
  target: Target,
  'tree-pine': TreePine,
  zap: Zap,
} as const;

export const topicIconOptions = [
  { value: 'book-open', label: 'Book Open' },
  { value: 'grid-3x3', label: 'Grid 3x3' },
  { value: 'code-2', label: 'Code' },
  { value: 'search', label: 'Search' },
  { value: 'shuffle', label: 'Shuffle' },
  { value: 'git-branch', label: 'Git Branch' },
  { value: 'bar-chart-3', label: 'Bar Chart' },
  { value: 'binary', label: 'Binary' },
  { value: 'layers', label: 'Layers' },
  { value: 'tree-pine', label: 'Tree Pine' },
  { value: 'network', label: 'Network' },
  { value: 'cpu', label: 'CPU' },
  { value: 'zap', label: 'Zap' },
  { value: 'target', label: 'Target' },
  { value: 'database', label: 'Database' },
  { value: 'hash', label: 'Hash' },
  { value: 'file-text', label: 'File Text' },
  { value: 'mouse-pointer', label: 'Mouse Pointer' },
];

export const defaultTopics: TopicDefinition[] = [
  { name: 'Basics', slug: 'basics', description: 'Loops, control flow and logic.', iconKey: 'book-open', difficulty: 'Easy', problemCount: 25, order: 1, isActive: true },
  { name: 'Arrays', slug: 'arrays', description: 'Matrices and sliding windows.', iconKey: 'grid-3x3', difficulty: 'Easy', problemCount: 45, order: 2, isActive: true },
  { name: 'Strings', slug: 'strings', description: 'Pattern matching and parsing.', iconKey: 'code-2', difficulty: 'Medium', problemCount: 38, order: 3, isActive: true },
  { name: 'Binary Search', slug: 'binary-search', description: 'O(log n) optimization.', iconKey: 'search', difficulty: 'Medium', problemCount: 32, order: 4, isActive: true },
  { name: 'Recursion', slug: 'recursion', description: 'Solving sub-problems.', iconKey: 'shuffle', difficulty: 'Medium', problemCount: 26, order: 5, isActive: true },
  { name: 'Linked Lists', slug: 'linked-lists', description: 'Pointer manipulation.', iconKey: 'git-branch', difficulty: 'Easy', problemCount: 30, order: 6, isActive: true },
  { name: 'Sorting', slug: 'sorting', description: 'Merge, quick and heap sort.', iconKey: 'bar-chart-3', difficulty: 'Medium', problemCount: 28, order: 7, isActive: true },
  { name: 'Bit Manipulation', slug: 'bit-manipulation', description: 'XOR, shifts and masks.', iconKey: 'binary', difficulty: 'Hard', problemCount: 18, order: 8, isActive: true },
  { name: 'Stacks & Queues', slug: 'stacks-queues', description: 'LIFO and FIFO operations.', iconKey: 'layers', difficulty: 'Medium', problemCount: 28, order: 9, isActive: true },
  { name: 'Trees', slug: 'trees', description: 'DFS, BFS and traversals.', iconKey: 'tree-pine', difficulty: 'Medium', problemCount: 42, order: 10, isActive: true },
  { name: 'Graphs', slug: 'graphs', description: 'Shortest paths and cycles.', iconKey: 'network', difficulty: 'Hard', problemCount: 38, order: 11, isActive: true },
  { name: 'DP', slug: 'dynamic-programming', description: 'Memoization and tabulation.', iconKey: 'cpu', difficulty: 'Hard', problemCount: 45, order: 12, isActive: true },
  { name: 'Backtracking', slug: 'backtracking', description: 'Constraint satisfaction.', iconKey: 'zap', difficulty: 'Hard', problemCount: 22, order: 13, isActive: true },
  { name: 'Greedy', slug: 'greedy', description: 'Local optimization.', iconKey: 'target', difficulty: 'Medium', problemCount: 29, order: 14, isActive: true },
  { name: 'Heaps', slug: 'heaps', description: 'Priority queues.', iconKey: 'database', difficulty: 'Medium', problemCount: 24, order: 15, isActive: true },
  { name: 'Tries', slug: 'tries', description: 'Prefix trees.', iconKey: 'hash', difficulty: 'Hard', problemCount: 16, order: 16, isActive: true },
  { name: 'Segment Trees', slug: 'segment-trees', description: 'Range queries.', iconKey: 'file-text', difficulty: 'Hard', problemCount: 14, order: 17, isActive: true },
  { name: 'Two Pointers', slug: 'two-pointers', description: 'In-place array operations.', iconKey: 'mouse-pointer', difficulty: 'Medium', problemCount: 35, order: 18, isActive: true },
];

export const getTopicIcon = (iconKey: string, size = 20) => {
  const Icon = iconMap[iconKey as keyof typeof iconMap] || BookOpen;
  return <Icon size={size} />;
};