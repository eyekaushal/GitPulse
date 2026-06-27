function ProfileHeader({ profile }) {
  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="profile-header">
      <div className="profile-info">
        <img
          src={profile.avatarUrl}
          alt={profile.login}
          className="avatar"
        />
        <div className="profile-details">
          <h2 className="profile-name">{profile.name || profile.login}</h2>
          <p className="profile-login">@{profile.login}</p>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          <div className="profile-meta">
            {profile.company && <span>🏢 {profile.company}</span>}
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.blog && (
              <span>
                🔗{' '}
                <a
                  href={
                    profile.blog.startsWith('http')
                      ? profile.blog
                      : `https://${profile.blog}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.blog}
                </a>
              </span>
            )}
            <span>📅 Joined {joinDate}</span>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-value">{profile.totalRepos}</span>
          <span className="stat-label">Repos</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{profile.totalStars.toLocaleString()}</span>
          <span className="stat-label">Stars</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{profile.totalForks.toLocaleString()}</span>
          <span className="stat-label">Forks</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{profile.followers.toLocaleString()}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{profile.following}</span>
          <span className="stat-label">Following</span>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;