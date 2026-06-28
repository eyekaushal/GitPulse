import React, { useState } from 'react';
import { compareProfiles } from '../api/github';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

const ComparePage = () => {
  const [username1, setUsername1] = useState('');
  const [username2, setUsername2] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = async (e) => {
    e.preventDefault();
    const u1 = username1.trim();
    const u2 = username2.trim();
    if (!u1 || !u2) return setError('Enter both usernames');
    if (u1.toLowerCase() === u2.toLowerCase())
      return setError('Enter two different usernames');

    setError('');
    setLoading(true);
    setData(null);

    try {
      const result = await compareProfiles(u1, u2);
      setData(result);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to compare profiles. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const buildStatsData = () => {
    if (!data) return [];
    const { profile1: p1, profile2: p2 } = data;
    const n1 = p1.profile.login;
    const n2 = p2.profile.login;
    return [
      { stat: 'Repos', [n1]: p1.profile.totalRepos, [n2]: p2.profile.totalRepos },
      { stat: 'Stars', [n1]: p1.profile.totalStars, [n2]: p2.profile.totalStars },
      { stat: 'Forks', [n1]: p1.profile.totalForks, [n2]: p2.profile.totalForks },
      { stat: 'Followers', [n1]: p1.profile.followers, [n2]: p2.profile.followers },
      { stat: 'Following', [n1]: p1.profile.following, [n2]: p2.profile.following },
      { stat: 'Commits', [n1]: p1.streakStats.totalCommits, [n2]: p2.streakStats.totalCommits },
    ];
  };

  const buildLangData = () => {
    if (!data) return [];
    const { profile1: p1, profile2: p2 } = data;
    const n1 = p1.profile.login;
    const n2 = p2.profile.login;
    const langSet = new Set();
    p1.languageBreakdown.forEach((l) => langSet.add(l.language));
    p2.languageBreakdown.forEach((l) => langSet.add(l.language));

    return [...langSet]
      .map((lang) => ({
        name: lang,
        [n1]: p1.languageBreakdown.find((l) => l.language === lang)?.percentage || 0,
        [n2]: p2.languageBreakdown.find((l) => l.language === lang)?.percentage || 0,
      }))
      .sort((a, b) => (b[n1] + b[n2]) - (a[n1] + a[n2]))
      .slice(0, 8);
  };

  const buildTimelineData = () => {
    if (!data) return [];
    const { profile1: p1, profile2: p2 } = data;
    const n1 = p1.profile.login;
    const n2 = p2.profile.login;
    const dateMap = {};

    p1.commitTimeline.forEach((d) => {
      dateMap[d.date] = { date: d.date, [n1]: d.commits };
    });
    p2.commitTimeline.forEach((d) => {
      if (!dateMap[d.date]) dateMap[d.date] = { date: d.date };
      dateMap[d.date][n2] = d.commits;
    });

    return Object.values(dateMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatBytes = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${Math.round(value / 1000000)}M`;
    if (value >= 1000) return `${Math.round(value / 1000)}K`;
    return value;
  };

  const n1 = data?.profile1?.profile?.login;
  const n2 = data?.profile2?.profile?.login;

  return (
    <div className="compare-page">
      <div className="compare-header">
        <h1>Compare Developers</h1>
        <p className="compare-subtitle">
          See how two GitHub profiles stack up side by side
        </p>
      </div>

      <form className="compare-form" onSubmit={handleCompare}>
        <div className="compare-inputs">
          <input
            type="text"
            placeholder="First username"
            value={username1}
            onChange={(e) => setUsername1(e.target.value)}
            className="compare-input"
            disabled={loading}
          />
          <span className="compare-vs">VS</span>
          <input
            type="text"
            placeholder="Second username"
            value={username2}
            onChange={(e) => setUsername2(e.target.value)}
            className="compare-input"
            disabled={loading}
          />
        </div>
        <button type="submit" className="compare-btn" disabled={loading}>
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </form>

      {error && <div className="compare-error">{error}</div>}

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching profiles from GitHub...</p>
        </div>
      )}

      {data && (
        <div className="compare-results">
          <div className="compare-profiles">
            <MiniProfile profileData={data.profile1} />
            <MiniProfile profileData={data.profile2} />
          </div>

          <div className="card compare-chart-card">
            <h2>Stats Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={buildStatsData()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis type="number" stroke="#8b949e" tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <YAxis dataKey="stat" type="category" stroke="#8b949e" width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
                  labelStyle={{ color: '#e6edf3' }}
                />
                <Legend />
                <Bar dataKey={n1} fill="#58a6ff" radius={[0, 4, 4, 0]} />
                <Bar dataKey={n2} fill="#3fb950" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card compare-chart-card">
            <h2>Language Breakdown (%)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={buildLangData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="name" stroke="#8b949e" />
                <YAxis stroke="#8b949e" tickFormatter={(v) => `${v}%`} width={50} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
                  labelStyle={{ color: '#e6edf3' }}
                  formatter={(value) => `${value}%`}
                />
                <Legend />
                <Bar dataKey={n1} fill="#58a6ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey={n2} fill="#3fb950" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card compare-chart-card">
            <h2>Commit Activity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={buildTimelineData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="date" stroke="#8b949e" tickFormatter={formatDate} />
                <YAxis stroke="#8b949e" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
                  labelStyle={{ color: '#e6edf3' }}
                  labelFormatter={formatDate}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey={n1}
                  stroke="#58a6ff"
                  fill="#58a6ff"
                  fillOpacity={0.15}
                />
                <Area
                  type="monotone"
                  dataKey={n2}
                  stroke="#3fb950"
                  fill="#3fb950"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="compare-streaks">
            <StreakCard
              label={n1}
              stats={data.profile1.streakStats}
              color="#58a6ff"
            />
            <StreakCard
              label={n2}
              stats={data.profile2.streakStats}
              color="#3fb950"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const MiniProfile = ({ profileData: p }) => (
  <div className="card mini-profile">
    <img src={p.profile.avatarUrl} alt={p.profile.login} className="mini-avatar" />
    <h3>{p.profile.name || p.profile.login}</h3>
    <p className="mini-login">@{p.profile.login}</p>
    {p.profile.bio && <p className="mini-bio">{p.profile.bio}</p>}
    <div className="mini-stats">
      <span>{p.profile.totalRepos} repos</span>
      <span>{p.profile.followers} followers</span>
      <span>{p.streakStats.totalCommits} commits</span>
    </div>
  </div>
);

const StreakCard = ({ label, stats, color }) => (
  <div className="card streak-compare-card" style={{ borderTop: `3px solid ${color}` }}>
    <h3 style={{ color }}>{label}</h3>
    <div className="streak-grid">
      <div className="streak-item">
        <span className="streak-value">{stats.currentStreak}</span>
        <span className="streak-label">Current Streak</span>
      </div>
      <div className="streak-item">
        <span className="streak-value">{stats.longestStreak}</span>
        <span className="streak-label">Longest Streak</span>
      </div>
      <div className="streak-item">
        <span className="streak-value">{stats.totalActiveDays}</span>
        <span className="streak-label">Active Days</span>
      </div>
      <div className="streak-item">
        <span className="streak-value">{stats.totalCommits}</span>
        <span className="streak-label">Total Commits</span>
      </div>
    </div>
  </div>
);

export default ComparePage;