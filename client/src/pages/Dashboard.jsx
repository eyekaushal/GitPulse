import { useState } from 'react';
import { fetchProfile } from '../api/github';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import ProfileHeader from '../components/ProfileHeader';
import StreakStats from '../components/StreakStats';
import LanguageChart from '../components/LanguageChart';
import CommitTimeline from '../components/CommitTimeline';
import ActivityHeatmap from '../components/ActivityHeatmap';
import TopRepos from '../components/TopRepos';
import InsightCards from '../components/InsightCards';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');

  async function handleSearch(searchUsername) {
    setLoading(true);
    setError(null);
    setData(null);
    setUsername(searchUsername);

    try {
      const result = await fetchProfile(searchUsername);
      setData(result);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError(`User "${searchUsername}" not found on GitHub. Check the spelling and try again.`);
      } else if (status === 429) {
        setError('GitHub API rate limit exceeded. Please wait a few minutes and try again.');
      } else {
        setError(err.response?.data?.error || err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <h1 className="dashboard-title">GitPulse</h1>
        <p className="dashboard-subtitle">
          Visualize any GitHub developer's activity and stats
        </p>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading && <Loading />}

      {data && (
        <div className="results">
          <ProfileHeader profile={data.profile} />
          <StreakStats streakStats={data.streakStats} />
          <div className="two-column">
            <LanguageChart languages={data.languageBreakdown} />
            <CommitTimeline timeline={data.commitTimeline} />
          </div>
          <ActivityHeatmap heatmap={data.activityHeatmap} />
          <TopRepos repos={data.topRepos} username={username} />
          <InsightCards insights={data.insights} />
          {data.cached && (
            <p className="cache-note">
              📦 Cached data from {new Date(data.fetchedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <div className="landing-state">
          <div className="landing-icon">🔍</div>
          <p>Enter a GitHub username above to get started</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;