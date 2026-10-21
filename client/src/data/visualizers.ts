export type AlgorithmCategory = string;

export type AlgorithmDifficulty = 'Easy' | 'Medium' | 'Hard';

export type VisualizerStatus = 'available' | 'unavailable';

export type VisualizerType = 'algorithm' | 'data-structure' | 'problem';

export interface DataStructureOperation {
  name: string;
  timeComplexity: string;
  spaceComplexity?: string;
  description?: string;
}

export interface ComplexityInfo {
  best: string;
  average: string;
  worst: string;
}

export interface VisualizerCategoryInfo {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  isDefault?: boolean;
  count?: number;
}

export interface VisualizerAlgorithm {
  id: string;
  slug: string;
  name: string;
  type?: VisualizerType;
  dataStructureType?: string;
  operations?: DataStructureOperation[];
  problemId?: number;
  problemTitle?: string;
  problemTopic?: string;
  problemDifficulty?: string;
  problemLink?: string;
  category: AlgorithmCategory;
  difficulty: AlgorithmDifficulty;
  description: string;
  htmlPath?: string;
  renderUrl?: string;
  storageType?: 'r2' | 'local';
  r2Key?: string;
  r2Bucket?: string;
  fileSize?: number;
  fileChecksum?: string;
  originalFileName?: string;
  status: VisualizerStatus;
  timeComplexity: ComplexityInfo;
  spaceComplexity: string;
  tags: string[];
  prerequisites?: string[];
  keyConcepts: string[];
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const DATA_STRUCTURE_FAMILIES = [
  'All',
  'Linear',
  'Trees & BST',
  'Heaps & Hashing',
  'Graphs & Advanced',
];

export const VISUALIZER_CATEGORIES: string[] = [
  'Searching',
  'Sorting',
  'Graphs',
  'Dynamic Programming',
  'Trees',
  'Backtracking',
  'Greedy',
  'Linked Lists',
  'Heaps',
  'Trie',
  'Bit Manipulation',
  'Arrays',
  'Strings',
];

export const visualizerAlgorithms: VisualizerAlgorithm[] = [
  {
    id: 'binary-search',
    slug: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    difficulty: 'Easy',
    description: 'An efficient search algorithm that finds the position of a target value within a sorted array by repeatedly halving the search interval.',
    htmlPath: '/visualizers/binary-search.html',
    status: 'unavailable',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(1)',
    tags: ['Divide and Conquer', 'Two Pointers', 'Sorted Array'],
    keyConcepts: [
      'Requires array elements to be monotonically sorted.',
      'Maintains left and right boundary pointers.',
      'Computes midpoint safely using left + (right - left) / 2.',
    ],
  },
  {
    id: 'linear-search',
    slug: 'linear-search',
    name: 'Linear Search',
    category: 'Searching',
    difficulty: 'Easy',
    description: 'A sequential search algorithm that checks every element in a list one by one until a match is found or the end is reached.',
    htmlPath: '/visualizers/linear-search.html',
    status: 'unavailable',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(1)',
    tags: ['Sequential', 'Brute Force', 'Unsorted'],
    keyConcepts: [
      'Works on unsorted or arbitrary order collections.',
      'Iterates from index 0 to n-1 sequentially.',
      'Best for small or unindexed datasets.',
    ],
  },
  {
    id: 'bubble-sort',
    slug: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    description: 'A comparison-based sorting algorithm where adjacent elements are repeatedly swapped if they are in the wrong order until the array is sorted.',
    htmlPath: '/visualizers/bubble-sort.html',
    status: 'unavailable',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    tags: ['Comparison Sort', 'In-Place', 'Stable'],
    keyConcepts: [
      'Heaviest unsorted elements "bubble up" to the end on each pass.',
      'Can be optimized with an early-exit flag if no swaps occur.',
      'Stable sorting algorithm maintaining original duplicate order.',
    ],
  },
  {
    id: 'merge-sort',
    slug: 'merge-sort',
    name: 'Merge Sort',
    category: 'Sorting',
    difficulty: 'Medium',
    description: 'A divide-and-conquer sorting algorithm that divides the array into halves, recursively sorts them, and merges the sorted halves.',
    htmlPath: '/visualizers/merge-sort.html',
    status: 'unavailable',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    spaceComplexity: 'O(n)',
    tags: ['Divide and Conquer', 'Recursion', 'Stable'],
    keyConcepts: [
      'Divides list into halves until subarrays contain single elements.',
      'Merges sorted subarrays back together in linear time.',
      'Guarantees O(n log n) runtime across all input cases.',
    ],
  },
  {
    id: 'quick-sort',
    slug: 'quick-sort',
    name: 'Quick Sort',
    category: 'Sorting',
    difficulty: 'Medium',
    description: 'A divide-and-conquer algorithm that selects a pivot element and partitions the array such that smaller elements precede larger ones.',
    htmlPath: '/visualizers/quick-sort.html',
    status: 'unavailable',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(log n)',
    tags: ['Partitioning', 'In-Place', 'Unstable'],
    keyConcepts: [
      'Selects a pivot (Lomuto or Hoare partitioning schemes).',
      'Rearranges elements so that elements < pivot are left, > pivot are right.',
      'Recursively sorts sub-partitions with low memory overhead.',
    ],
  },
  {
    id: 'bfs',
    slug: 'bfs',
    name: 'Breadth-First Search (BFS)',
    category: 'Graphs',
    difficulty: 'Medium',
    description: 'A traversal algorithm that visits vertices level by level using a queue, guaranteeing the shortest path in unweighted graphs.',
    htmlPath: '/visualizers/bfs.html',
    status: 'unavailable',
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V)',
    tags: ['Graph Traversal', 'Queue', 'Shortest Path', 'Level Order'],
    keyConcepts: [
      'Explores all neighbor nodes at current depth prior to advancing.',
      'Uses a First-In-First-Out (FIFO) queue.',
      'Computes minimum edge distance in unweighted graphs.',
    ],
  },
  {
    id: 'dfs',
    slug: 'dfs',
    name: 'Depth-First Search (DFS)',
    category: 'Graphs',
    difficulty: 'Medium',
    description: 'A traversal algorithm that explores as far as possible along each branch before backtracking, utilizing a stack or recursion.',
    htmlPath: '/visualizers/dfs.html',
    status: 'unavailable',
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V)',
    tags: ['Graph Traversal', 'Recursion', 'Backtracking', 'Stack'],
    keyConcepts: [
      'Explores deepest vertex paths first, backtracking when blocked.',
      'Uses recursive call stack or explicit LIFO stack.',
      'Foundation for topological sorting and cycle detection.',
    ],
  },
  {
    id: 'dijkstra',
    slug: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'Graphs',
    difficulty: 'Medium',
    description: 'A greedy algorithm that finds the shortest path from a single source vertex to all other vertices in a weighted graph with non-negative edge weights.',
    htmlPath: '/visualizers/dijkstra.html',
    status: 'unavailable',
    timeComplexity: {
      best: 'O((V + E) log V)',
      average: 'O((V + E) log V)',
      worst: 'O((V + E) log V)',
    },
    spaceComplexity: 'O(V)',
    tags: ['Shortest Path', 'Priority Queue', 'Greedy', 'Weighted Graph'],
    keyConcepts: [
      'Maintains min-heap priority queue of unsettled distances.',
      'Relaxes adjacent edges greedily by selecting minimal distance node.',
      'Requires all edge weights to be non-negative.',
    ],
  },
  {
    id: 'floyd-warshall',
    slug: 'floyd-warshall',
    name: 'Floyd–Warshall Algorithm',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    description: 'An all-pairs shortest path dynamic programming algorithm that finds the shortest paths between all pairs of vertices in a weighted graph.',
    htmlPath: '/visualizers/floyd-warshall.html',
    status: 'unavailable',
    timeComplexity: {
      best: 'O(V³)',
      average: 'O(V³)',
      worst: 'O(V³)',
    },
    spaceComplexity: 'O(V²)',
    tags: ['All-Pairs Shortest Path', 'Dynamic Programming', 'Matrix'],
    keyConcepts: [
      'Computes matrix dist[i][j] by trying all intermediate vertices k.',
      'State transition: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).',
      'Can detect negative weight cycles if dist[i][i] < 0.',
    ],
  },
];

export function getVisualizerBySlug(slug: string): VisualizerAlgorithm | undefined {
  return visualizerAlgorithms.find((item) => item.slug === slug);
}

export function getAllVisualizers(): VisualizerAlgorithm[] {
  return visualizerAlgorithms;
}

export function getVisualizersByCategory(category: AlgorithmCategory): VisualizerAlgorithm[] {
  return visualizerAlgorithms.filter((item) => item.category === category);
}
