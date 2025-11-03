// src/api/api.js
import axios from 'axios';

// CHANGE THIS LINE - use import.meta.env instead of process.env
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = {
  getUser: async (id) => {
    const res = await axios.get(`${BASE}/users/${id}`, { headers: { Accept: 'application/json' }});
    return res.data;
  },
  updateUser: async (id, payload) => {
    const res = await axios.put(`${BASE}/users/${id}`, payload);
    return res.data;
  },
  followUser: async (id) => {
    // Also fix the endpoint from /follow to /echo
    const res = await axios.post(`${BASE}/users/${id}/echo`, {});
    return res.data;
  },
  whisperUser: async (id, message) => {
    const res = await axios.post(`${BASE}/users/${id}/whisper`, { message });
    return res.data;
  },
};