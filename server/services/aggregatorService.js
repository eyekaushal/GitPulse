function aggregateAll(githubData) {
    const { user, repos, repoLanguages, events } = githubData;
  
    return {
      profile: buildProfileSummary(user, repos),
      languageBreakdown: buildLanguageBreakdown(repoLanguages),
      activityHeatmap: buildActivityHeatmap(events),
      commitTimeline: buildCommitTimeline(events),
      topRepos: buildTopRepos(repos),
      streakStats: buildStreakStats(events),
      eventSummary: buildEventSummary(events)
    };
  }
  
  function buildProfileSummary(user, repos) {
    const ownRepos = repos.filter(r => !r.fork);
    const totalStars = repos.reduce((sum, r) => sum + r.stargazersCount, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forksCount, 0);
  
    return {
      ...user,
      totalRepos: repos.length,
      ownRepos: ownRepos.length,
      forkedRepos: repos.length - ownRepos.length,
      totalStars,
      totalForks
    };
  }
  
  function buildLanguageBreakdown(repoLanguages) {
    const totals = {};
  
    for (const repoName of Object.keys(repoLanguages)) {
      const langs = repoLanguages[repoName];
      for (const [lang, bytes] of Object.entries(langs)) {
        totals[lang] = (totals[lang] || 0) + bytes;
      }
    }
  
    const totalBytes = Object.values(totals).reduce((s, b) => s + b, 0);
    if (totalBytes === 0) return [];
  
    return Object.entries(totals)
      .map(([language, bytes]) => ({
        language,
        bytes,
        percentage: Math.round((bytes / totalBytes) * 1000) / 10
      }))
      .sort((a, b) => b.bytes - a.bytes);
  }
  
  function buildActivityHeatmap(events) {
    // 7 days x 24 hours grid
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
    const pushEvents = events.filter(e => e.type === 'PushEvent');
    for (const event of pushEvents) {
      const date = new Date(event.createdAt);
      const day = date.getUTCDay();
      const hour = date.getUTCHours();
      const commitCount = event.payload?.size || 1;
      grid[day][hour] += commitCount;
    }
  
    const heatmapData = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmapData.push({
          day: dayNames[day],
          dayIndex: day,
          hour,
          count: grid[day][hour]
        });
      }
    }
  
    return heatmapData;
  }
  
  function buildCommitTimeline(events) {
    const dailyCounts = {};
    const pushEvents = events.filter(e => e.type === 'PushEvent');
  
    for (const event of pushEvents) {
      const date = new Date(event.createdAt).toISOString().split('T')[0];
      const commitCount = event.payload?.size || 1;
      dailyCounts[date] = (dailyCounts[date] || 0) + commitCount;
    }
  
    return Object.entries(dailyCounts)
      .map(([date, commits]) => ({ date, commits }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  
  function buildTopRepos(repos) {
    return repos
      .filter(r => !r.fork)
      .sort((a, b) => {
        const scoreA = a.stargazersCount * 3 + a.forksCount * 2 + (a.size / 100);
        const scoreB = b.stargazersCount * 3 + b.forksCount * 2 + (b.size / 100);
        return scoreB - scoreA;
      })
      .slice(0, 10)
      .map(r => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazersCount,
        forks: r.forksCount,
        topics: r.topics,
        updatedAt: r.updatedAt,
        createdAt: r.createdAt
      }));
  }
  
  function buildStreakStats(events) {
    const pushEvents = events.filter(e => e.type === 'PushEvent');
    if (pushEvents.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0, totalCommits: 0 };
    }
  
    const activeDates = new Set();
    let totalCommits = 0;
  
    for (const event of pushEvents) {
      const date = new Date(event.createdAt).toISOString().split('T')[0];
      activeDates.add(date);
      totalCommits += event.payload?.size || 1;
    }
  
    const sortedDates = [...activeDates].sort();
    const today = new Date().toISOString().split('T')[0];
  
    // Calculate streaks
    let longestStreak = 1;
    let currentRun = 1;
  
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
  
      if (diffDays === 1) {
        currentRun++;
        longestStreak = Math.max(longestStreak, currentRun);
      } else {
        currentRun = 1;
      }
    }
  
    // Current streak: count backwards from today/last active day
    let currentStreak = 0;
    const lastActive = sortedDates[sortedDates.length - 1];
    const lastDate = new Date(lastActive);
    const todayDate = new Date(today);
    const daysSinceLast = (todayDate - lastDate) / (1000 * 60 * 60 * 24);
  
    if (daysSinceLast <= 1) {
      currentStreak = 1;
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const curr = new Date(sortedDates[i + 1]);
        const prev = new Date(sortedDates[i]);
        if ((curr - prev) / (1000 * 60 * 60 * 24) === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  
    return {
      currentStreak,
      longestStreak,
      totalActiveDays: activeDates.size,
      totalCommits
    };
  }
  
  function buildEventSummary(events) {
    const summary = {};
    for (const event of events) {
      summary[event.type] = (summary[event.type] || 0) + 1;
    }
    return summary;
  }
  
  module.exports = { aggregateAll };