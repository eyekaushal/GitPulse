const { fetchAllData } = require('../services/githubService');
const { aggregateAll } = require('../services/aggregatorService');
const { generateInsights } = require('../services/insightsEngine');
const { getCachedProfile, setCachedProfile } = require('../services/cacheService');

// ─── Shared helper: fetch + process one profile ───
async function getProfileData(username) {
  const cached = await getCachedProfile(username);
  if (cached) {
    return {
      ...cached.aggregatedData,
      insights: cached.insights,
      cached: true,
      fetchedAt: cached.fetchedAt,
    };
  }

  const githubData = await fetchAllData(username);
  const aggregatedData = aggregateAll(githubData);
  const insights = generateInsights(githubData, aggregatedData);

  await setCachedProfile(username, { githubData, aggregatedData, insights });

  return {
    ...aggregatedData,
    insights,
    cached: false,
    fetchedAt: new Date(),
  };
}

// ─── GET /api/profile/:username ───
async function getProfile(req, res, next) {
  try {
    const { username } = req.params;
    if (!username || username.length > 39) {
      return res.status(400).json({ error: 'Invalid GitHub username' });
    }

    const data = await getProfileData(username);
    return res.json(data);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'GitHub user not found' });
    }
    if (err.response?.status === 403) {
      return res.status(429).json({ error: 'GitHub API rate limit exceeded. Try again later.' });
    }
    next(err);
  }
}

// ─── GET /api/compare/:username1/:username2 ───
async function compareProfiles(req, res, next) {
  try {
    const { username1, username2 } = req.params;

    if (!username1 || !username2 || username1.length > 39 || username2.length > 39) {
      return res.status(400).json({ error: 'Invalid GitHub username(s)' });
    }

    if (username1.toLowerCase() === username2.toLowerCase()) {
      return res.status(400).json({ error: 'Please provide two different usernames to compare' });
    }

    const [profile1, profile2] = await Promise.all([
      getProfileData(username1),
      getProfileData(username2),
    ]);

    return res.json({ profile1, profile2 });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'One or both users not found on GitHub' });
    }
    if (err.response?.status === 403) {
      return res.status(429).json({ error: 'GitHub API rate limit exceeded. Try again later.' });
    }
    next(err);
  }
}

module.exports = { getProfile, compareProfiles };