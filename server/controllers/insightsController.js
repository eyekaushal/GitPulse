const { fetchAllData } = require('../services/githubService');
const { aggregateAll } = require('../services/aggregatorService');
const { generateInsights } = require('../services/insightsEngine');
const { getCachedProfile, setCachedProfile } = require('../services/cacheService');

async function getInsights(req, res, next) {
  try {
    const { username } = req.params;
    if (!username || username.length > 39) {
      return res.status(400).json({ error: 'Invalid GitHub username' });
    }

    // Check cache
    const cached = await getCachedProfile(username);
    if (cached && cached.insights) {
      return res.json({
        username,
        insights: cached.insights,
        cached: true
      });
    }

    // Fetch and generate
    const githubData = await fetchAllData(username);
    const aggregatedData = aggregateAll(githubData);
    const insights = generateInsights(githubData, aggregatedData);

    await setCachedProfile(username, { githubData, aggregatedData, insights });

    return res.json({
      username,
      insights,
      cached: false
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'GitHub user not found' });
    }
    if (err.response?.status === 403) {
      return res.status(429).json({ error: 'GitHub API rate limit exceeded' });
    }
    next(err);
  }
}

module.exports = { getInsights };