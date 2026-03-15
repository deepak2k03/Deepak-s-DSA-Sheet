const TOPIC_ALIASES = {
  basic: 'basics',
  basics: 'basics',
  array: 'arrays',
  arrays: 'arrays',
  string: 'strings',
  strings: 'strings',
  'binary search': 'binary-search',
  recursion: 'recursion',
  'linked list': 'linked-lists',
  'linked lists': 'linked-lists',
  sorting: 'sorting',
  'bit manipulation': 'bit-manipulation',
  'stack and queue': 'stacks-queues',
  'stacks and queues': 'stacks-queues',
  'stacks queues': 'stacks-queues',
  tree: 'trees',
  trees: 'trees',
  graph: 'graphs',
  graphs: 'graphs',
  dp: 'dynamic-programming',
  'dynamic programming': 'dynamic-programming',
  backtracking: 'backtracking',
  greedy: 'greedy',
  heap: 'heaps',
  heaps: 'heaps',
  trie: 'tries',
  tries: 'tries',
  'segment tree': 'segment-trees',
  'segment trees': 'segment-trees',
  'two pointers': 'two-pointers',
};

const normalizeTopicText = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getCanonicalTopicSlug = (value = '') => {
  const normalized = normalizeTopicText(value);

  if (!normalized) {
    return '';
  }

  return TOPIC_ALIASES[normalized] || normalized.replace(/\s+/g, '-');
};

const slugifyTopic = (value = '') =>
  normalizeTopicText(value).replace(/\s+/g, '-');

module.exports = {
  getCanonicalTopicSlug,
  slugifyTopic,
};