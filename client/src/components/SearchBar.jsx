import { useState } from 'react';

function SearchBar({ onSearch, loading }) {
  const [input, setInput] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  }

  return (
    <div className="search-section">
      <h1 className="app-title">GitPulse</h1>
      <p className="app-subtitle">GitHub Developer Activity Storyteller</p>
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter GitHub username..."
          className="search-input"
          disabled={loading}
        />
        <button
          type="submit"
          className="search-button"
          disabled={loading || !input.trim()}
        >
          {loading ? 'Searching...' : 'Analyze'}
        </button>
      </form>
    </div>
  );
}

export default SearchBar;