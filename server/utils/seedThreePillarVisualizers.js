const Visualizer = require('../models/Visualizer');
const Problem = require('../models/Problem');

const defaultDataStructures = [
  {
    name: 'Singly Linked List',
    slug: 'singly-linked-list',
    type: 'data-structure',
    dataStructureType: 'Linear',
    category: 'Linked Lists',
    difficulty: 'Easy',
    description: 'A linear collection of data elements whose order is not given by their physical placement in memory, with each node pointing forward to the next node.',
    status: 'unavailable',
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    tags: ['Linked List', 'Pointers', 'Linear Data Structure'],
    operations: [
      { name: 'Insert at Head', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Prepends a node at index 0 and updates the head reference.' },
      { name: 'Insert at Tail', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Appends a node at the end using a tail pointer.' },
      { name: 'Delete by Value', timeComplexity: 'O(n)', spaceComplexity: 'O(1)', description: 'Traverses to target node and updates preceding next pointer.' },
      { name: 'Search Key', timeComplexity: 'O(n)', spaceComplexity: 'O(1)', description: 'Sequential linear search from head to tail.' },
      { name: 'Reverse Entire List', timeComplexity: 'O(n)', spaceComplexity: 'O(1)', description: 'Iteratively inverts all pointer links in-place using 3 pointers.' },
    ],
    order: 10,
  },
  {
    name: 'Doubly Linked List',
    slug: 'doubly-linked-list',
    type: 'data-structure',
    dataStructureType: 'Linear',
    category: 'Linked Lists',
    difficulty: 'Medium',
    description: 'A linear data structure consisting of nodes with two pointer references: one to the next node and one to the previous node, enabling bidirectional traversal.',
    status: 'unavailable',
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    tags: ['Doubly Linked', 'Bidirectional', 'Pointers'],
    operations: [
      { name: 'Insert Front', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Inserts new node before current head and links prev/next.' },
      { name: 'Insert Back', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Inserts new node after tail and links prev/next.' },
      { name: 'Delete Given Node', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Removes node directly using prev and next pointers without traversal.' },
      { name: 'Forward / Backward Traversal', timeComplexity: 'O(n)', spaceComplexity: 'O(1)', description: 'Navigates from head to tail or tail to head.' },
    ],
    order: 11,
  },
  {
    name: 'Stack (LIFO)',
    slug: 'stack-lifo',
    type: 'data-structure',
    dataStructureType: 'Linear',
    category: 'Stacks & Queues',
    difficulty: 'Easy',
    description: 'A Last-In, First-Out (LIFO) abstract data type with strict access restricted to the topmost element.',
    status: 'unavailable',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(n)',
    tags: ['LIFO', 'Stack Frame', 'Push/Pop'],
    operations: [
      { name: 'Push', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Adds an element onto the top of the stack.' },
      { name: 'Pop', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Removes and retrieves the topmost element.' },
      { name: 'Peek / Top', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Reads the top element without removing it.' },
      { name: 'IsEmpty', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Checks if stack has zero elements.' },
    ],
    order: 12,
  },
  {
    name: 'Queue & Deque (FIFO)',
    slug: 'queue-fifo',
    type: 'data-structure',
    dataStructureType: 'Linear',
    category: 'Stacks & Queues',
    difficulty: 'Easy',
    description: 'A First-In, First-Out (FIFO) linear structure where elements are inserted at the back and removed from the front.',
    status: 'unavailable',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(n)',
    tags: ['FIFO', 'Queue', 'Deque'],
    operations: [
      { name: 'Enqueue (Push Back)', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Appends element to the tail of the queue.' },
      { name: 'Dequeue (Pop Front)', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Removes and returns element from the head of the queue.' },
      { name: 'Front / Peek', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Inspects front element without dequeuing.' },
      { name: 'Push Front (Deque)', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Double-ended queue operation to insert at head.' },
      { name: 'Pop Back (Deque)', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Double-ended queue operation to remove from tail.' },
    ],
    order: 13,
  },
  {
    name: 'Binary Search Tree (BST)',
    slug: 'binary-search-tree',
    type: 'data-structure',
    dataStructureType: 'Trees & BST',
    category: 'Trees',
    difficulty: 'Medium',
    description: 'A rooted binary tree with the key ordering invariant: left subtree keys < node key < right subtree keys.',
    status: 'unavailable',
    timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    tags: ['Tree', 'Binary Search', 'Recursion'],
    operations: [
      { name: 'Insert Key', timeComplexity: 'O(log n)', spaceComplexity: 'O(1)', description: 'Traverses left or right based on key and attaches at leaf.' },
      { name: 'Search Key', timeComplexity: 'O(log n)', spaceComplexity: 'O(1)', description: 'Follows binary comparison branch until match or leaf reached.' },
      { name: 'Delete Node (3 Cases)', timeComplexity: 'O(log n)', spaceComplexity: 'O(1)', description: 'Handles no child, 1 child, or 2 children via inorder successor swap.' },
      { name: 'Inorder Traversal', timeComplexity: 'O(n)', spaceComplexity: 'O(h)', description: 'Produces strictly ascending sorted sequence of keys.' },
      { name: 'Find Min / Max', timeComplexity: 'O(log n)', spaceComplexity: 'O(1)', description: 'Follows leftmost or rightmost pointers to extremum.' },
    ],
    order: 14,
  },
  {
    name: 'Binary Heap & Priority Queue',
    slug: 'binary-heap',
    type: 'data-structure',
    dataStructureType: 'Heaps & Hashing',
    category: 'Heaps',
    difficulty: 'Medium',
    description: 'A complete binary tree satisfying the heap-order property where each parent node is smaller (Min-Heap) or larger (Max-Heap) than its children.',
    status: 'unavailable',
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(n)',
    tags: ['Heap', 'Priority Queue', 'Complete Tree'],
    operations: [
      { name: 'Insert Element (Sift Up)', timeComplexity: 'O(log n)', spaceComplexity: 'O(1)', description: 'Places at bottom array index and bubbles upward.' },
      { name: 'Extract Top (Sift Down)', timeComplexity: 'O(log n)', spaceComplexity: 'O(1)', description: 'Replaces root with last leaf and sinks downward.' },
      { name: 'Peek Root', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Reads minimum or maximum key in constant time.' },
      { name: 'Heapify Array', timeComplexity: 'O(n)', spaceComplexity: 'O(1)', description: 'Converts arbitrary array into valid heap in linear time.' },
    ],
    order: 15,
  },
  {
    name: 'Hash Table (HashMap)',
    slug: 'hash-table',
    type: 'data-structure',
    dataStructureType: 'Heaps & Hashing',
    category: 'Hashing',
    difficulty: 'Medium',
    description: 'An associative data structure that maps keys to values using a mathematical hash function with bucket collision chaining.',
    status: 'unavailable',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    tags: ['Hash Function', 'Buckets', 'Chaining'],
    operations: [
      { name: 'Put (Key, Value)', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Hashes key to bucket index and inserts/updates entry.' },
      { name: 'Get (Key)', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Computes hash index and searches bucket chain.' },
      { name: 'Remove (Key)', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Unlinks entry from bucket chain.' },
      { name: 'Collision Chaining', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Appends multiple colliding keys to bucket linked list.' },
    ],
    order: 16,
  },
  {
    name: 'Disjoint Set Union (DSU / Union-Find)',
    slug: 'disjoint-set-union',
    type: 'data-structure',
    dataStructureType: 'Graphs & Advanced',
    category: 'Graphs',
    difficulty: 'Medium',
    description: 'A data structure that tracks a set of elements partitioned into non-overlapping subsets, supporting near-constant time union and find operations.',
    status: 'unavailable',
    timeComplexity: { best: 'O(1)', average: 'O(α(n))', worst: 'O(α(n))' },
    spaceComplexity: 'O(n)',
    tags: ['DSU', 'Union-Find', 'Connected Components'],
    operations: [
      { name: 'Find (Path Compression)', timeComplexity: 'O(α(n))', spaceComplexity: 'O(1)', description: 'Finds canonical representative and flattens parent pointers.' },
      { name: 'Union by Rank / Size', timeComplexity: 'O(α(n))', spaceComplexity: 'O(1)', description: 'Attaches shallower tree root under deeper root.' },
      { name: 'Connected (u, v)', timeComplexity: 'O(α(n))', spaceComplexity: 'O(1)', description: 'Checks if Find(u) === Find(v).' },
    ],
    order: 17,
  },
  {
    name: 'Trie (Prefix Tree)',
    slug: 'trie-prefix-tree',
    type: 'data-structure',
    dataStructureType: 'Trees & BST',
    category: 'Trie',
    difficulty: 'Medium',
    description: 'A specialized tree structure used to store an associative array where keys are usually strings, ideal for fast prefix searches and auto-completion.',
    status: 'unavailable',
    timeComplexity: { best: 'O(m)', average: 'O(m)', worst: 'O(m)' },
    spaceComplexity: 'O(Σ * m)',
    tags: ['Trie', 'Prefix Tree', 'Strings', 'Auto-Complete'],
    operations: [
      { name: 'Insert Word', timeComplexity: 'O(m)', spaceComplexity: 'O(m)', description: 'Walks down characters creating child nodes and sets isTerminal = true.' },
      { name: 'Search Exact Word', timeComplexity: 'O(m)', spaceComplexity: 'O(1)', description: 'Follows character branches and verifies end-of-word flag.' },
      { name: 'StartsWith (Prefix Search)', timeComplexity: 'O(m)', spaceComplexity: 'O(1)', description: 'Validates existence of prefix sequence.' },
    ],
    order: 18,
  },
];

const seedThreePillarVisualizers = async () => {
  try {
    // 1. Ensure all existing visualizers have type: 'algorithm' if unset
    await Visualizer.updateMany(
      { $or: [{ type: { $exists: false } }, { type: null }] },
      { $set: { type: 'algorithm' } }
    );

    // 2. Insert or update default Data Structures
    for (const ds of defaultDataStructures) {
      const existing = await Visualizer.findOne({ slug: ds.slug });
      if (!existing) {
        await Visualizer.create(ds);
        console.log(`Created default data structure: ${ds.name}`);
      } else {
        // Update type and operations if missing
        if (!existing.type || existing.type !== 'data-structure' || !existing.operations || existing.operations.length === 0) {
          existing.type = 'data-structure';
          existing.dataStructureType = ds.dataStructureType;
          existing.operations = ds.operations;
          await existing.save();
        }
      }
    }

    // 3. Seed default Problem Solution visualizer templates for Sheet Problems #1 and #2
    const sampleProblemIds = [1, 2];
    for (const pid of sampleProblemIds) {
      const problem = await Problem.findOne({ id: pid, isDeleted: { $ne: true } });
      if (problem) {
        const slug = `problem-${problem.id}-${problem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`;
        let vis = await Visualizer.findOne({ slug });
        if (!vis) {
          vis = await Visualizer.create({
            name: `${problem.title} — Visual Solution`,
            slug,
            type: 'problem',
            problemId: problem.id,
            problemTitle: problem.title,
            problemTopic: problem.topic,
            problemDifficulty: problem.difficulty,
            problemLink: problem.link,
            category: problem.topic ? (problem.topic.charAt(0).toUpperCase() + problem.topic.slice(1)) : 'Arrays',
            difficulty: problem.difficulty || 'Easy',
            description: `Interactive step-by-step visual solution animation for DSA Sheet problem #${problem.id}: ${problem.title}.`,
            status: 'unavailable',
            timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
            spaceComplexity: 'O(1)',
            tags: [problem.topic, 'Sheet Problem', 'Visual Solution'],
            keyConcepts: [
              `Directly linked to DSA Sheet problem #${problem.id}.`,
              'Interactive runtime step-by-step state visualization.',
              'Uploaded and rendered from Cloudflare R2 object storage.',
            ],
            order: 20 + pid,
          });
          console.log(`Created problem visualizer for problem #${problem.id}`);
        }

        // Link onto problem
        if (!problem.hasVisualizer || problem.visualizerSlug !== slug) {
          problem.hasVisualizer = true;
          problem.visualizerSlug = slug;
          await problem.save();
        }
      }
    }
  } catch (err) {
    console.error('seedThreePillarVisualizers error:', err.message);
  }
};

module.exports = seedThreePillarVisualizers;
