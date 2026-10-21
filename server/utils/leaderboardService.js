const User = require('../models/User');
const Settings = require('../models/Settings');

const DEFAULT_LEADERBOARD_SETTINGS = {
  // Display settings
  isLeaderboardEnabled: true,
  isPodiumEnabled: true,
  isSummaryStatsEnabled: true,
  showStatActiveLearners: true,
  showStatTotalSolved: true,
  showStatTopStreak: true,
  showStatLastUpdated: true,
  showWeeklyFilter: true,
  showMonthlyFilter: true,
  showStreakColumn: true,
  showThisWeekColumn: true,
  showLastSolvedColumn: true,
  showLevelBadge: true,
  isSearchEnabled: true,
  rowsPerPage: 15,

  // Ranking settings
  defaultPeriod: 'all', // 'all' | 'weekly' | 'monthly'
  showZeroSolves: true,
  tieBreaker: 'earliest_solve', // 'earliest_solve' | 'account_age' | 'alphabetical'

  // Cache settings
  cacheDurationSeconds: 30,
};

// In-memory cache
let rawUserCache = null;
let lastRawCacheTime = 0;

/**
 * Get current leaderboard settings from database or defaults
 */
async function getLeaderboardSettings() {
  try {
    const doc = await Settings.findOne({ key: 'leaderboard' }).lean();
    if (doc && doc.value) {
      return { ...DEFAULT_LEADERBOARD_SETTINGS, ...doc.value };
    }
  } catch (error) {
    console.error('Failed to fetch leaderboard settings:', error.message);
  }
  return { ...DEFAULT_LEADERBOARD_SETTINGS };
}

/**
 * Save leaderboard settings to database
 */
async function updateLeaderboardSettings(newSettings) {
  const merged = { ...DEFAULT_LEADERBOARD_SETTINGS, ...newSettings };
  const updated = await Settings.findOneAndUpdate(
    { key: 'leaderboard' },
    { key: 'leaderboard', value: merged },
    { upsert: true, new: true }
  ).lean();
  clearLeaderboardDataCache();
  return updated.value;
}

/**
 * Clear in-memory cache
 */
function clearLeaderboardDataCache() {
  rawUserCache = null;
  lastRawCacheTime = 0;
}

/**
 * Get last cache timestamp
 */
function getLastCacheTime() {
  return lastRawCacheTime;
}

/**
 * Calculate user streaks based on solve history dates
 */
function calculateStreaks(solvedHistory) {
  if (!solvedHistory || solvedHistory.length === 0) {
    return { maxStreak: 0, currentStreak: 0 };
  }

  const dateStrings = solvedHistory
    .map((e) => {
      try {
        return e.solvedAt ? new Date(e.solvedAt).toISOString().split('T')[0] : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const uniqueSorted = Array.from(new Set(dateStrings)).sort();
  if (uniqueSorted.length === 0) {
    return { maxStreak: 0, currentStreak: 0 };
  }

  let maxStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueSorted.length; i++) {
    const prev = new Date(uniqueSorted[i - 1]);
    const curr = new Date(uniqueSorted[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else if (diffDays > 1) {
      tempStreak = 1;
    }
  }

  // Current streak relative to today
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const lastDate = uniqueSorted[uniqueSorted.length - 1];
  let currentStreak = 0;

  if (lastDate === todayStr || lastDate === yesterday) {
    let streak = 0;
    let check = new Date(lastDate);
    const dateSet = new Set(uniqueSorted);
    while (dateSet.has(check.toISOString().split('T')[0])) {
      streak++;
      check.setDate(check.getDate() - 1);
    }
    currentStreak = streak;
  }

  return { maxStreak, currentStreak };
}

/**
 * Calculate user level from total problems solved
 */
function calculateLevel(totalSolved) {
  if (!totalSolved || totalSolved <= 0) return 1;
  return Math.max(1, Math.min(99, Math.floor(Math.sqrt(totalSolved * 0.45)) + 1));
}

/**
 * Fetch and process all active user metrics
 */
async function getProcessedUsers(cacheDurationSeconds = 30) {
  const now = Date.now();
  const cacheDurationMs = Math.max(cacheDurationSeconds, 5) * 1000;

  if (rawUserCache && (now - lastRawCacheTime < cacheDurationMs)) {
    return { users: rawUserCache, lastUpdated: new Date(lastRawCacheTime).toISOString() };
  }

  const users = await User.find({ isActive: { $ne: false } })
    .select('username solvedProblems solvedHistory createdAt')
    .lean();

  // Date boundaries
  const nowObj = new Date();
  
  // Start of Week (Sunday 00:00:00)
  const startOfWeek = new Date(nowObj);
  startOfWeek.setDate(nowObj.getDate() - nowObj.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of Month (1st day of month 00:00:00)
  const startOfMonth = new Date(nowObj.getFullYear(), nowObj.getMonth(), 1, 0, 0, 0);

  const processed = users.map((user) => {
    const solvedSet = new Set(user.solvedProblems || []);
    const totalSolved = solvedSet.size;

    const history = user.solvedHistory || [];
    let lastSolvedAt = null;
    const weekSolvedSet = new Set();
    const monthSolvedSet = new Set();

    for (const h of history) {
      if (!h || !h.solvedAt) continue;
      const d = new Date(h.solvedAt);
      if (isNaN(d.getTime())) continue;

      if (!lastSolvedAt || d > lastSolvedAt) {
        lastSolvedAt = d;
      }
      if (d >= startOfWeek) {
        weekSolvedSet.add(h.problemId);
      }
      if (d >= startOfMonth) {
        monthSolvedSet.add(h.problemId);
      }
    }

    const { maxStreak, currentStreak } = calculateStreaks(history);

    return {
      username: user.username || 'Anonymous',
      totalSolved,
      solvedThisWeek: weekSolvedSet.size,
      solvedThisMonth: monthSolvedSet.size,
      maxStreak,
      currentStreak,
      lastSolvedAt: lastSolvedAt ? lastSolvedAt.toISOString() : null,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
      level: calculateLevel(totalSolved),
    };
  });

  rawUserCache = processed;
  lastRawCacheTime = now;

  return { users: processed, lastUpdated: new Date(now).toISOString() };
}

/**
 * Main query function to get paginated, sorted, and filtered leaderboard data
 */
async function queryLeaderboard(options = {}) {
  const settings = await getLeaderboardSettings();

  if (!settings.isLeaderboardEnabled && !options.isAdminPreview) {
    return {
      isEnabled: false,
      summary: { totalLearners: 0, totalSolved: 0, topStreak: 0, lastUpdated: new Date().toISOString() },
      podium: [],
      users: [],
      pagination: { total: 0, page: 1, limit: settings.rowsPerPage || 15, pages: 1 },
      settings,
    };
  }

  const { users: allUsers, lastUpdated } = await getProcessedUsers(settings.cacheDurationSeconds);

  // Selected period: 'all' | 'weekly' | 'monthly'
  let period = options.period || settings.defaultPeriod || 'all';
  if (period === 'weekly' && !settings.showWeeklyFilter && !options.isAdminPreview) period = 'all';
  if (period === 'monthly' && !settings.showMonthlyFilter && !options.isAdminPreview) period = 'all';

  // Overall platform summary stats
  const totalLearners = allUsers.length;
  let totalSolvedSum = 0;
  let topStreak = 0;

  for (const u of allUsers) {
    totalSolvedSum += u.totalSolved;
    if (u.maxStreak > topStreak) topStreak = u.maxStreak;
  }

  // Derive primary score for the selected period
  const scored = allUsers.map((u) => {
    let score = u.totalSolved;
    if (period === 'weekly') score = u.solvedThisWeek;
    if (period === 'monthly') score = u.solvedThisMonth;
    return { ...u, score, solvedCount: score };
  });

  // Filter out zero-solves if configured (unless searching by username)
  const search = (options.search || '').trim().toLowerCase();
  let filtered = scored;

  if (!settings.showZeroSolves && !search) {
    filtered = filtered.filter((u) => u.score > 0);
  }

  // Apply deterministic tie-breaking sort
  filtered.sort((a, b) => {
    // 1. Primary score descending
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // 2. Secondary tie-breaker based on settings
    if (settings.tieBreaker === 'earliest_solve') {
      if (a.lastSolvedAt && b.lastSolvedAt) {
        const diff = new Date(a.lastSolvedAt).getTime() - new Date(b.lastSolvedAt).getTime();
        if (diff !== 0) return diff; // earlier solve ranked higher
      } else if (a.lastSolvedAt && !b.lastSolvedAt) {
        return -1;
      } else if (!a.lastSolvedAt && b.lastSolvedAt) {
        return 1;
      }
    } else if (settings.tieBreaker === 'account_age') {
      if (a.createdAt && b.createdAt) {
        const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (diff !== 0) return diff;
      }
    }

    // 3. Fallback: alphabetical
    return (a.username || '').localeCompare(b.username || '');
  });

  // Assign global ranks to all sorted users
  const rankedUsers = filtered.map((u, index) => ({
    ...u,
    rank: index + 1,
  }));

  // Podium is top 3 from the ranked list
  const podium = settings.isPodiumEnabled ? rankedUsers.slice(0, 3) : [];

  // Search filter
  let displayUsers = rankedUsers;
  if (search) {
    displayUsers = displayUsers.filter((u) => (u.username || '').toLowerCase().includes(search));
  }

  // Find current user's entry if username provided
  let currentUserEntry = null;
  if (options.currentUsername) {
    const target = options.currentUsername.toLowerCase();
    currentUserEntry = rankedUsers.find(
      (u) => (u.username || '').toLowerCase() === target
    ) || null;
  }

  // Pagination
  const limit = Math.min(Math.max(Number.parseInt(options.limit, 10) || settings.rowsPerPage || 15, 5), 100);
  const page = Math.max(Number.parseInt(options.page, 10) || 1, 1);
  const total = displayUsers.length;
  const pages = Math.max(Math.ceil(total / limit), 1);
  const skip = (page - 1) * limit;
  const paginatedUsers = displayUsers.slice(skip, skip + limit);

  return {
    isEnabled: true,
    period,
    summary: {
      totalLearners,
      totalSolved: totalSolvedSum,
      topStreak,
      lastUpdated,
    },
    podium,
    users: paginatedUsers,
    currentUser: currentUserEntry,
    pagination: {
      total,
      page,
      limit,
      pages,
    },
    settings: {
      isLeaderboardEnabled: settings.isLeaderboardEnabled,
      isPodiumEnabled: settings.isPodiumEnabled,
      isSummaryStatsEnabled: settings.isSummaryStatsEnabled,
      showStatActiveLearners: settings.showStatActiveLearners,
      showStatTotalSolved: settings.showStatTotalSolved,
      showStatTopStreak: settings.showStatTopStreak,
      showStatLastUpdated: settings.showStatLastUpdated,
      showWeeklyFilter: settings.showWeeklyFilter,
      showMonthlyFilter: settings.showMonthlyFilter,
      showStreakColumn: settings.showStreakColumn,
      showThisWeekColumn: settings.showThisWeekColumn,
      showLastSolvedColumn: settings.showLastSolvedColumn,
      showLevelBadge: settings.showLevelBadge,
      isSearchEnabled: settings.isSearchEnabled,
      rowsPerPage: settings.rowsPerPage,
      defaultPeriod: settings.defaultPeriod,
      showZeroSolves: settings.showZeroSolves,
      tieBreaker: settings.tieBreaker,
    },
  };
}

module.exports = {
  DEFAULT_LEADERBOARD_SETTINGS,
  getLeaderboardSettings,
  updateLeaderboardSettings,
  clearLeaderboardDataCache,
  getLastCacheTime,
  calculateStreaks,
  calculateLevel,
  queryLeaderboard,
};
