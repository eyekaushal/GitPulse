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
      const message = err.response?.data?.error || err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard">
      <SearchBar onSearch={handleSearch} loading={loading} />

      {error && <div className="error-message">❌ {error}</div>}

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
    </div>
  );
}

export default Dashboard;