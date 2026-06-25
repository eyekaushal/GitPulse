import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export async function fetchProfile(username) {
  const response = await api.get(`/api/profile/${username}`);
  return response.data;
}

export async function fetchInsights(username) {
  const response = await api.get(`/api/insights/${username}`);
  return response.data;
}

export async function fetchComparison(username1, username2) {
  const response = await api.get('/api/compare', {
    params: { users: `${username1},${username2}` },
  });
  return response.data;
}

export async function createShareLink(username, data) {
  const response = await api.post('/api/share', { username, data });
  return response.data;
}

export async function fetchSharedProfile(slug) {
  const response = await api.get(`/api/share/${slug}`);
  return response.data;
}

export async function checkHealth() {
  const response = await api.get('/api/health');
  return response.data;
}