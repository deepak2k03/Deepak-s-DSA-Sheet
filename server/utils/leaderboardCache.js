let leaderboardCache = [];
let lastCacheTime = 0;
const CACHE_DURATION = 30 * 1000;

const getCachedLeaderboard = () => {
  const now = Date.now();
  if (leaderboardCache.length > 0 && now - lastCacheTime < CACHE_DURATION) {
    return leaderboardCache;
  }
  return null;
};

const setCachedLeaderboard = (data) => {
  leaderboardCache = data;
  lastCacheTime = Date.now();
};

const clearLeaderboardCache = () => {
  leaderboardCache = [];
  lastCacheTime = 0;
  try {
    const { clearLeaderboardDataCache } = require('./leaderboardService');
    clearLeaderboardDataCache();
  } catch {}
};

module.exports = {
  getCachedLeaderboard,
  setCachedLeaderboard,
  clearLeaderboardCache,
};
