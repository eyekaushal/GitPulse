import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
});

export async function fetchProfile(username) {
  const res = await api.get(`/profile/${username}`);
  return res.data;
}

export async function compareProfiles(username1, username2) {
  const res = await api.get(`/compare/${username1}/${username2}`);
  return res.data;
}

export async function createShareLink(data) {
  const res = await api.post('/share', data);
  return res.data;
}

export async function getShareLink(token) {
  const res = await api.get(`/share/${token}`);
  return res.data;
}

export async function checkHealth() {
  const res = await api.get('/health');
  return res.data;
}

export default api;