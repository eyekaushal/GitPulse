const { Profile } = require('../models');

const CACHE_TTL_HOURS = parseInt(process.env.CACHE_TTL_HOURS) || 6;

async function getCachedProfile(username) {
  const profile = await Profile.findOne({ where: { username: username.toLowerCase() } });

  if (!profile || !profile.fetchedAt) return null;

  const ageMs = Date.now() - new Date(profile.fetchedAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  if (ageHours > CACHE_TTL_HOURS) return null;

  return {
    githubData: profile.githubData,
    aggregatedData: profile.aggregatedData,
    insights: profile.insights,
    fetchedAt: profile.fetchedAt
  };
}

async function setCachedProfile(username, { githubData, aggregatedData, insights }) {
  const [profile] = await Profile.upsert({
    username: username.toLowerCase(),
    githubData,
    aggregatedData,
    insights,
    fetchedAt: new Date()
  });
  return profile;
}

async function invalidateCache(username) {
  await Profile.update(
    { fetchedAt: null },
    { where: { username: username.toLowerCase() } }
  );
}

module.exports = { getCachedProfile, setCachedProfile, invalidateCache };