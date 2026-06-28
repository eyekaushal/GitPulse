import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export async function fetchProfile(username) {
  const res = await api.get(`/api/profile/${username}`);
  return res.data;
}

export async function compareProfiles(username1, username2) {
  const res = await api.get(`/api/compare/${username1}/${username2}`);
  return res.data;
}

export async function createShareLink(data) {
  const res = await api.post('/api/share', data);
  return res.data;
}

export async function getShareLink(token) {
  const res = await api.get(`/api/share/${token}`);
  return res.data;
}

export async function checkHealth() {
  const res = await api.get('/api/health');
  return res.data;
}

export default api;