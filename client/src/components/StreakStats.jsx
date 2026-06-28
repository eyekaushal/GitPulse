function StreakStats({ streakStats }) {
  const stats = [
    { label: 'Current Streak', value: `${streakStats.currentStreak} days`,  },
    { label: 'Longest Streak', value: `${streakStats.longestStreak} days`,  },
    { label: 'Active Days', value: streakStats.totalActiveDays,  },
    { label: 'Total Commits', value: streakStats.totalCommits,  },
  ];

  return (
    <div className="section">
      <h3 className="section-title">Streak Stats</h3>
      <div className="streak-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="streak-card">
            <span className="streak-icon">{stat.icon}</span>
            <span className="streak-value">{stat.value}</span>
            <span className="streak-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StreakStats;