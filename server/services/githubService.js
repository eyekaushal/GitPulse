const axios = require('axios');

const github = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  }
});

async function fetchUser(username) {
  const { data } = await github.get(`/users/${username}`);
  return {
    login: data.login,
    name: data.name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    company: data.company,
    location: data.location,
    blog: data.blog,
    twitterUsername: data.twitter_username,
    publicRepos: data.public_repos,
    followers: data.followers,
    following: data.following,
    createdAt: data.created_at
  };
}

async function fetchAllRepos(username) {
  const repos = [];
  let page = 1;
  while (true) {
    const { data } = await github.get(`/users/${username}/repos`, {
      params: { per_page: 100, sort: 'updated', page }
    });
    if (data.length === 0) break;
    repos.push(...data.map(r => ({
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      fork: r.fork,
      stargazersCount: r.stargazers_count,
      watchersCount: r.watchers_count,
      forksCount: r.forks_count,
      language: r.language,
      topics: r.topics || [],
      size: r.size,
      defaultBranch: r.default_branch,
      openIssuesCount: r.open_issues_count,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      pushedAt: r.pushed_at
    })));
    if (data.length < 100) break;
    page++;
  }
  return repos;
}

async function fetchRepoLanguages(username, repos) {
  const BATCH_SIZE = 10;
  const languageMap = {};

  for (let i = 0; i < repos.length; i += BATCH_SIZE) {
    const batch = repos.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(repo =>
        github.get(`/repos/${username}/${repo.name}/languages`)
      )
    );
    results.forEach((result, idx) => {
      const repoName = batch[idx].name;
      if (result.status === 'fulfilled') {
        languageMap[repoName] = result.value.data;
      }
    });
  }

  return languageMap;
}

async function fetchEvents(username) {
  const events = [];
  for (let page = 1; page <= 10; page++) {
    try {
      const { data } = await github.get(`/users/${username}/events`, {
        params: { per_page: 100, page }
      });
      if (data.length === 0) break;
      events.push(...data.map(e => ({
        type: e.type,
        repo: e.repo?.name,
        createdAt: e.created_at,
        payload: extractPayload(e)
      })));
      if (data.length < 100) break;
    } catch {
      break;
    }
  }
  return events;
}

function extractPayload(event) {
  switch (event.type) {
    case 'PushEvent':
      return {
        size: event.payload.size,
        commits: (event.payload.commits || []).map(c => ({
          sha: c.sha,
          message: c.message
        }))
      };
    case 'PullRequestEvent':
      return {
        action: event.payload.action,
        title: event.payload.pull_request?.title,
        merged: event.payload.pull_request?.merged
      };
    case 'IssuesEvent':
      return {
        action: event.payload.action,
        title: event.payload.issue?.title
      };
    case 'CreateEvent':
      return {
        refType: event.payload.ref_type,
        ref: event.payload.ref
      };
    case 'ForkEvent':
      return {
        forkee: event.payload.forkee?.full_name
      };
    case 'WatchEvent':
      return { action: event.payload.action };
    default:
      return {};
  }
}

async function fetchAllData(username) {
  const user = await fetchUser(username);
  const repos = await fetchAllRepos(username);
  const repoLanguages = await fetchRepoLanguages(username, repos);
  const events = await fetchEvents(username);

  return { user, repos, repoLanguages, events };
}

function getRateLimitInfo() {
  return github.get('/rate_limit').then(r => r.data);
}

module.exports = { fetchAllData, getRateLimitInfo };