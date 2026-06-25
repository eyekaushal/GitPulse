import { useState } from 'react';
import { fetchProfile } from './api/github';
import './App.css';

function App() {
  const [username, setUsername] = useState('torvalds');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFetch() {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await fetchProfile(username);
      console.log('=== GitPulse API Response ===');
      console.log('Full response:', result);
      console.log('Profile:', result.profile);
      console.log('Language Breakdown:', result.languageBreakdown);
      console.log('Activity Heatmap (first 5):', result.activityHeatmap?.slice(0, 5));
      console.log('Commit Timeline:', result.commitTimeline);
      console.log('Top Repos:', result.topRepos);
      console.log('Streak Stats:', result.streakStats);
      console.log('Event Summary:', result.eventSummary);
      console.log('Insights:', result.insights);
      console.log('Cached:', result.cached);
      console.log('============================');
      setData(result);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>GitPulse — API Test</h1>
      <p>Open browser DevTools → Console tab to see the full response shape.</p>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="GitHub username"
          style={{ padding: '8px', fontSize: '16px', marginRight: '10px', width: '250px' }}
        />
        <button
          onClick={handleFetch}
          disabled={loading || !username.trim()}
          style={{ padding: '8px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          {loading ? 'Fetching...' : 'Fetch Profile'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {data && (
        <div>
          <h2>✅ Data received — check console for full shape</h2>
          <pre style={{
            background: '#f4f4f4',
            padding: '16px',
            overflow: 'auto',
            maxHeight: '500px',
            fontSize: '13px'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;