function TopRepos({ repos, username }) {
  if (!repos || repos.length === 0) return null;

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return 'today';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }

  return (
    <div className="section">
      <h3 className="section-title">Top Repositories</h3>
      <div className="repos-grid">
        {repos.map((repo) => (
          <div key={repo.name} className="repo-card">
            <div className="repo-header">
              <a
                href={`https://github.com/${username}/${repo.name}`}
                target="_blank"
                rel="noreferrer"
                className="repo-name"
              >
                {repo.name}
              </a>
              {repo.language && (
                <span className="repo-language">{repo.language}</span>
              )}
            </div>
            {repo.description && (
              <p className="repo-description">{repo.description}</p>
            )}
            <div className="repo-stats">
              <span>⭐ {repo.stars}</span>
              <span>🍴 {repo.forks}</span>
              <span>Updated {timeAgo(repo.updatedAt)}</span>
            </div>
            {repo.topics && repo.topics.length > 0 && (
              <div className="repo-topics">
                {repo.topics.slice(0, 5).map((topic) => (
                  <span key={topic} className="topic-tag">
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopRepos;