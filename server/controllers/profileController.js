const { fetchAllData } = require('../services/githubService');
const { aggregateAll } = require('../services/aggregatorService');
const { generateInsights } = require('../services/insightsEngine');
const { getCachedProfile, setCachedProfile } = require('../services/cacheService');

async function getProfile(req, res, next) {
  try {
    const { username } = req.params;
    if (!username || username.length > 39) {
      return res.status(400).json({ error: 'Invalid GitHub username' });
    }

    // Check cache
    const cached = await getCachedProfile(username);
    if (cached) {
      return res.json({
        ...cached.aggregatedData,
        insights: cached.insights,
        cached: true,
        fetchedAt: cached.fetchedAt
      });
    }

    // Fetch fresh data
    const githubData = await fetchAllData(username);
    const aggregatedData = aggregateAll(githubData);
    const insights = generateInsights(githubData, aggregatedData);

    // Cache it
    await setCachedProfile(username, { githubData, aggregatedData, insights });

    return res.json({
      ...aggregatedData,
      insights,
      cached: false,
      fetchedAt: new Date()
    });
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

module.exports = { getProfile };