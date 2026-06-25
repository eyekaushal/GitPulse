function generateInsights(githubData, aggregatedData) {
    const insights = [];
  
    insights.push(detectCodingSchedule(aggregatedData.activityHeatmap));
    insights.push(detectLanguageEvolution(githubData.repos, githubData.repoLanguages));
    insights.push(detectConsistency(aggregatedData.streakStats, aggregatedData.commitTimeline));
    insights.push(detectWeekdayPatterns(aggregatedData.activityHeatmap));
    insights.push(detectCollaborationStyle(githubData.repos, githubData.events));
    insights.push(detectRepoFocus(githubData.repos, githubData.repoLanguages));
  
    return insights.filter(Boolean);
  }
  
  // 1. Coding Schedule — Night Owl, Early Bird, or 9-to-5
  function detectCodingSchedule(heatmap) {
    if (!heatmap || heatmap.length === 0) return null;
  
    const hourTotals = Array(24).fill(0);
    for (const cell of heatmap) {
      hourTotals[cell.hour] += cell.count;
    }
  
    const total = hourTotals.reduce((s, c) => s + c, 0);
    if (total === 0) return null;
  
    const nightCommits = hourTotals.slice(21, 24).reduce((s, c) => s + c, 0)
      + hourTotals.slice(0, 4).reduce((s, c) => s + c, 0); // 9PM - 4AM
    const morningCommits = hourTotals.slice(5, 9).reduce((s, c) => s + c, 0); // 5AM - 9AM
    const workHoursCommits = hourTotals.slice(9, 17).reduce((s, c) => s + c, 0); // 9AM - 5PM
  
    const nightPct = Math.round((nightCommits / total) * 100);
    const morningPct = Math.round((morningCommits / total) * 100);
    const workPct = Math.round((workHoursCommits / total) * 100);
  
    // Find peak hour
    const peakHour = hourTotals.indexOf(Math.max(...hourTotals));
    const peakFormatted = formatHour(peakHour);
  
    if (nightPct >= 40) {
      return {
        type: 'coding_schedule',
        icon: '🦉',
        title: 'Night Owl Coder',
        description: `${nightPct}% of commits land between 9 PM and 4 AM. Peak activity at ${peakFormatted}.`,
        stats: { nightPct, morningPct, workPct, peakHour: peakFormatted }
      };
    }
  
    if (morningPct >= 30) {
      return {
        type: 'coding_schedule',
        icon: '🌅',
        title: 'Early Bird Developer',
        description: `${morningPct}% of commits happen before 9 AM. The early code catches the bug.`,
        stats: { nightPct, morningPct, workPct, peakHour: peakFormatted }
      };
    }
  
    if (workPct >= 55) {
      return {
        type: 'coding_schedule',
        icon: '💼',
        title: 'Business Hours Builder',
        description: `${workPct}% of commits during 9-to-5 hours. Structured and disciplined.`,
        stats: { nightPct, morningPct, workPct, peakHour: peakFormatted }
      };
    }
  
    return {
      type: 'coding_schedule',
      icon: '⏰',
      title: 'Flex-Time Coder',
      description: `Commits spread across the day. Peak hour: ${peakFormatted}.`,
      stats: { nightPct, morningPct, workPct, peakHour: peakFormatted }
    };
  }
  
  // 2. Language Evolution — how their language usage has changed
  function detectLanguageEvolution(repos, repoLanguages) {
    if (!repos || repos.length === 0) return null;
  
    const ownRepos = repos.filter(r => !r.fork);
    if (ownRepos.length === 0) return null;
  
    // Sort by creation date
    const sorted = [...ownRepos].sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
    );
  
    // Split into halves: older vs newer
    const mid = Math.floor(sorted.length / 2);
    const olderRepos = sorted.slice(0, mid);
    const newerRepos = sorted.slice(mid);
  
    const olderLangs = countLanguages(olderRepos, repoLanguages);
    const newerLangs = countLanguages(newerRepos, repoLanguages);
  
    const topOlder = getTopN(olderLangs, 3);
    const topNewer = getTopN(newerLangs, 3);
  
    // Detect new languages in recent repos
    const newLangs = Object.keys(newerLangs).filter(l => !olderLangs[l]);
    const droppedLangs = Object.keys(olderLangs).filter(l => !newerLangs[l]);
  
    const totalLangs = new Set([...Object.keys(olderLangs), ...Object.keys(newerLangs)]).size;
  
    if (newLangs.length > 0) {
      return {
        type: 'language_evolution',
        icon: '📈',
        title: 'Expanding Toolkit',
        description: `Recently picked up ${newLangs.slice(0, 3).join(', ')}. Now working with ${totalLangs} languages total.`,
        stats: { newLangs, droppedLangs, topOlder, topNewer, totalLangs }
      };
    }
  
    if (totalLangs === 1) {
      const lang = Object.keys(newerLangs)[0] || Object.keys(olderLangs)[0];
      return {
        type: 'language_evolution',
        icon: '🎯',
        title: `${lang} Loyalist`,
        description: `All-in on ${lang}. Deep expertise over breadth.`,
        stats: { newLangs: [], droppedLangs: [], topOlder, topNewer, totalLangs }
      };
    }
  
    return {
      type: 'language_evolution',
      icon: '🔄',
      title: 'Steady Stack',
      description: `Consistent with ${topNewer.map(l => l[0]).join(', ')} across ${totalLangs} languages.`,
      stats: { newLangs, droppedLangs, topOlder, topNewer, totalLangs }
    };
  }
  
  // 3. Consistency — how regular are they
  function detectConsistency(streakStats, commitTimeline) {
    if (!streakStats || !commitTimeline || commitTimeline.length === 0) return null;
  
    const { currentStreak, longestStreak, totalActiveDays, totalCommits } = streakStats;
    const avgCommitsPerDay = totalActiveDays > 0
      ? Math.round((totalCommits / totalActiveDays) * 10) / 10
      : 0;
  
    // Calculate coefficient of variation for commit frequency
    const counts = commitTimeline.map(d => d.commits);
    const mean = counts.reduce((s, c) => s + c, 0) / counts.length;
    const variance = counts.reduce((s, c) => s + Math.pow(c - mean, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 0;
  
    if (longestStreak >= 14 && cv < 1) {
      return {
        type: 'consistency',
        icon: '🔥',
        title: 'Streak Machine',
        description: `${longestStreak}-day longest streak with ${avgCommitsPerDay} avg commits/day. Relentlessly consistent.`,
        stats: { currentStreak, longestStreak, totalActiveDays, avgCommitsPerDay }
      };
    }
  
    if (longestStreak >= 7) {
      return {
        type: 'consistency',
        icon: '📊',
        title: 'Steady Contributor',
        description: `${longestStreak}-day best streak. ${totalActiveDays} active days across the period.`,
        stats: { currentStreak, longestStreak, totalActiveDays, avgCommitsPerDay }
      };
    }
  
    if (totalActiveDays >= 5 && cv > 1.5) {
      return {
        type: 'consistency',
        icon: '⚡',
        title: 'Burst Coder',
        description: `Codes in intense bursts — ${avgCommitsPerDay} commits on active days, but with gaps between sessions.`,
        stats: { currentStreak, longestStreak, totalActiveDays, avgCommitsPerDay }
      };
    }
  
    return {
      type: 'consistency',
      icon: '🌱',
      title: 'Getting Started',
      description: `${totalActiveDays} active days so far. Every commit counts.`,
      stats: { currentStreak, longestStreak, totalActiveDays, avgCommitsPerDay }
    };
  }
  
  // 4. Weekday Patterns — Weekend Warrior vs Weekday Grinder
  function detectWeekdayPatterns(heatmap) {
    if (!heatmap || heatmap.length === 0) return null;
  
    let weekdayTotal = 0;
    let weekendTotal = 0;
  
    for (const cell of heatmap) {
      if (cell.dayIndex === 0 || cell.dayIndex === 6) {
        weekendTotal += cell.count;
      } else {
        weekdayTotal += cell.count;
      }
    }
  
    const total = weekdayTotal + weekendTotal;
    if (total === 0) return null;
  
    const weekendPct = Math.round((weekendTotal / total) * 100);
    const weekdayPct = 100 - weekendPct;
  
    // Find busiest day
    const dayTotals = Array(7).fill(0);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (const cell of heatmap) {
      dayTotals[cell.dayIndex] += cell.count;
    }
    const busiestDayIdx = dayTotals.indexOf(Math.max(...dayTotals));
  
    if (weekendPct >= 35) {
      return {
        type: 'weekday_patterns',
        icon: '🏄',
        title: 'Weekend Warrior',
        description: `${weekendPct}% of commits on weekends. Busiest day: ${dayNames[busiestDayIdx]}.`,
        stats: { weekdayPct, weekendPct, busiestDay: dayNames[busiestDayIdx] }
      };
    }
  
    if (weekdayPct >= 85) {
      return {
        type: 'weekday_patterns',
        icon: '💻',
        title: 'Weekday Warrior',
        description: `${weekdayPct}% of commits Monday–Friday. ${dayNames[busiestDayIdx]} is the power day.`,
        stats: { weekdayPct, weekendPct, busiestDay: dayNames[busiestDayIdx] }
      };
    }
  
    return {
      type: 'weekday_patterns',
      icon: '📅',
      title: 'Balanced Schedule',
      description: `${weekdayPct}% weekday, ${weekendPct}% weekend. Busiest on ${dayNames[busiestDayIdx]}s.`,
      stats: { weekdayPct, weekendPct, busiestDay: dayNames[busiestDayIdx] }
    };
  }
  
  // 5. Collaboration Style — solo builder vs team player
  function detectCollaborationStyle(repos, events) {
    if (!repos || repos.length === 0) return null;
  
    const ownRepos = repos.filter(r => !r.fork).length;
    const forkedRepos = repos.filter(r => r.fork).length;
    const forkRatio = repos.length > 0 ? Math.round((forkedRepos / repos.length) * 100) : 0;
  
    const prEvents = events.filter(e => e.type === 'PullRequestEvent').length;
    const issueEvents = events.filter(e => e.type === 'IssuesEvent').length;
    const pushEvents = events.filter(e => e.type === 'PushEvent').length;
    const totalEvents = events.length;
  
    const collabEvents = prEvents + issueEvents;
    const collabRatio = totalEvents > 0 ? Math.round((collabEvents / totalEvents) * 100) : 0;
  
    if (collabRatio >= 30 || forkRatio >= 40) {
      return {
        type: 'collaboration_style',
        icon: '🤝',
        title: 'Team Player',
        description: `${collabRatio}% of activity is PRs and issues. ${forkedRepos} forked repos show active community participation.`,
        stats: { ownRepos, forkedRepos, forkRatio, prEvents, issueEvents, collabRatio }
      };
    }
  
    if (collabRatio <= 5 && forkRatio <= 10) {
      return {
        type: 'collaboration_style',
        icon: '🏗️',
        title: 'Solo Architect',
        description: `${ownRepos} original repos, mostly push-driven. Builds from the ground up.`,
        stats: { ownRepos, forkedRepos, forkRatio, prEvents, issueEvents, collabRatio }
      };
    }
  
    return {
      type: 'collaboration_style',
      icon: '🔀',
      title: 'Hybrid Builder',
      description: `Mix of ${ownRepos} original repos and ${forkedRepos} forks. ${collabRatio}% collaborative activity.`,
      stats: { ownRepos, forkedRepos, forkRatio, prEvents, issueEvents, collabRatio }
    };
  }
  
  // 6. Repo Focus — Specialist vs Polyglot
  function detectRepoFocus(repos, repoLanguages) {
    if (!repos || repos.length === 0) return null;
  
    const ownRepos = repos.filter(r => !r.fork);
    if (ownRepos.length === 0) return null;
  
    // Count unique languages across all repos
    const allLangs = new Set();
    for (const repo of ownRepos) {
      const langs = repoLanguages[repo.name];
      if (langs) {
        Object.keys(langs).forEach(l => allLangs.add(l));
      }
    }
  
    const uniqueLangs = allLangs.size;
  
    // Topic diversity
    const allTopics = new Set();
    for (const repo of ownRepos) {
      (repo.topics || []).forEach(t => allTopics.add(t));
    }
  
    // Concentration: what % of code is in top language
    const langTotals = {};
    for (const repo of ownRepos) {
      const langs = repoLanguages[repo.name];
      if (langs) {
        for (const [lang, bytes] of Object.entries(langs)) {
          langTotals[lang] = (langTotals[lang] || 0) + bytes;
        }
      }
    }
    const totalBytes = Object.values(langTotals).reduce((s, b) => s + b, 0);
    const topLang = Object.entries(langTotals).sort((a, b) => b[1] - a[1])[0];
    const concentration = totalBytes > 0 && topLang
      ? Math.round((topLang[1] / totalBytes) * 100)
      : 0;
  
    if (uniqueLangs <= 2 && concentration >= 80) {
      return {
        type: 'repo_focus',
        icon: '🎯',
        title: `${topLang[0]} Specialist`,
        description: `${concentration}% of code in ${topLang[0]} across ${ownRepos.length} repos. Deep expertise.`,
        stats: { uniqueLangs, concentration, topLanguage: topLang[0], repoCount: ownRepos.length }
      };
    }
  
    if (uniqueLangs >= 5) {
      return {
        type: 'repo_focus',
        icon: '🌐',
        title: 'Polyglot Programmer',
        description: `${uniqueLangs} languages across ${ownRepos.length} repos. Versatile and adaptable.`,
        stats: { uniqueLangs, concentration, topLanguage: topLang?.[0], repoCount: ownRepos.length }
      };
    }
  
    return {
      type: 'repo_focus',
      icon: '📦',
      title: 'Focused Builder',
      description: `${uniqueLangs} languages, led by ${topLang?.[0]} at ${concentration}%. Focused but not narrow.`,
      stats: { uniqueLangs, concentration, topLanguage: topLang?.[0], repoCount: ownRepos.length }
    };
  }
  
  // --- Helpers ---
  
  function countLanguages(repos, repoLanguages) {
    const counts = {};
    for (const repo of repos) {
      const langs = repoLanguages[repo.name];
      if (langs) {
        for (const [lang, bytes] of Object.entries(langs)) {
          counts[lang] = (counts[lang] || 0) + bytes;
        }
      }
    }
    return counts;
  }
  
  function getTopN(langMap, n) {
    return Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n);
  }
  
  function formatHour(h) {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  }
  
  module.exports = { generateInsights };