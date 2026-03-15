let problemsCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 30 * 1000;

const getCachedProblems = () => {
  const now = Date.now();

  if (problemsCache && now - lastCacheTime < CACHE_DURATION) {
    return problemsCache;
  }

  return null;
};

const setCachedProblems = (problems) => {
  problemsCache = problems;
  lastCacheTime = Date.now();
};

const clearProblemsCache = () => {
  problemsCache = null;
  lastCacheTime = 0;
};

module.exports = {
  getCachedProblems,
  setCachedProblems,
  clearProblemsCache,
};