const TOPIC_ALIASES: Record<string, string> = {
  basic: 'basics',
  basics: 'basics',
  array: 'arrays',
  arrays: 'arrays',
  string: 'strings',
  strings: 'strings',
  'binary search': 'binary-search',
  'binary-search': 'binary-search',
  recursion: 'recursion',
  'linked list': 'linked-lists',
  'linked lists': 'linked-lists',
  'linked-list': 'linked-lists',
  'linked-lists': 'linked-lists',
  sorting: 'sorting',
  'bit manipulation': 'bit-manipulation',
  'bit-manipulation': 'bit-manipulation',
  'stacks & queues': 'stacks-queues',
  'stacks and queues': 'stacks-queues',
  'stack & queue': 'stacks-queues',
  'stack and queue': 'stacks-queues',
  'stacks queues': 'stacks-queues',
  'stacks-queues': 'stacks-queues',
  tree: 'trees',
  trees: 'trees',
  graph: 'graphs',
  graphs: 'graphs',
  dp: 'dynamic-programming',
  'dynamic programming': 'dynamic-programming',
  'dynamic-programming': 'dynamic-programming',
  backtracking: 'backtracking',
  greedy: 'greedy',
  heap: 'heaps',
  heaps: 'heaps',
  trie: 'tries',
  tries: 'tries',
  'segment tree': 'segment-trees',
  'segment trees': 'segment-trees',
  'segment-tree': 'segment-trees',
  'segment-trees': 'segment-trees',
  'two pointers': 'two-pointers',
  'two-pointers': 'two-pointers',
};

const normalizeRawTopic = (topic: string) =>
  topic
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const getCanonicalTopicSlug = (topic: string) => {
  const normalized = normalizeRawTopic(topic);

  if (!normalized) {
    return '';
  }

  return TOPIC_ALIASES[normalized] || normalized.replace(/\s+/g, '-');
};