const { fetchAllData } = require('../services/githubService');
const { aggregateAll } = require('../services/aggregatorService');
const { generateInsights } = require('../services/insightsEngine');
const { getCachedProfile, setCachedProfile } = require('../services/cacheService');

async function getComparison(req, res, next) {
  try {
    const { userA, userB } = req.query;

    if (!userA || !userB) {
      return res.status(400).json({ error: 'Both userA and userB query params required' });
    }

    if (userA.toLowerCase() === userB.toLowerCase()) {
      return res.status(400).json({ error: 'Cannot compare a user with themselves' });
    }

    const [profileA, profileB] = await Promise.all([
      fetchProfileData(userA),
      fetchProfileData(userB)
    ]);

    return res.json({
      userA: profileA,
      userB: profileB,
      comparison: buildComparison(profileA, profileB)
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: `GitHub user not found: ${err.username || 'unknown'}` });
    }
    if (err.response?.status === 403) {
      return res.status(429).json({ error: 'GitHub API rate limit exceeded' });
    }
    next(err);
  }
}

async function fetchProfileData(username) {
  const cached = await getCachedProfile(username);
  if (cached) {
    return {
      aggregatedData: cached.aggregatedData,
      insights: cached.insights,
      cached: true
    };
  }

  const githubData = await fetchAllData(username);
  const aggregatedData = aggregateAll(githubData);
  const insights = generateInsights(githubData, aggregatedData);

  await setCachedProfile(username, { githubData, aggregatedData, insights });

  return { aggregatedData, insights, cached: false };
}

function buildComparison(a, b) {
  const aData = a.aggregatedData;
  const bData = b.aggregatedData;

  return {
    stats: {
      totalStars: { userA: aData.profile.totalStars, userB: bData.profile.totalStars },
      totalRepos: { userA: aData.profile.totalRepos, userB: bData.profile.totalRepos },
      followers: { userA: aData.profile.followers, userB: bData.profile.followers },
      totalCommits: { userA: aData.streakStats.totalCommits, userB: bData.streakStats.totalCommits },
      longestStreak: { userA: aData.streakStats.longestStreak, userB: bData.streakStats.longestStreak },
      currentStreak: { userA: aData.streakStats.currentStreak, userB: bData.streakStats.currentStreak }
    },
    topLanguages: {
      userA: aData.languageBreakdown.slice(0, 5),
      userB: bData.languageBreakdown.slice(0, 5)
    },
    sharedLanguages: findSharedLanguages(aData.languageBreakdown, bData.languageBreakdown)
  };
}

function findSharedLanguages(langsA, langsB) {
  const setA = new Set(langsA.map(l => l.language));
  return langsB
    .filter(l => setA.has(l.language))
    .map(l => l.language);
}

module.exports = { getComparison };