const API_BASE_URL = 'https://macicast-backend.onrender.com/api';

export const endpoints = {
  upload: `${API_BASE_URL}/upload`,
  startStream: `${API_BASE_URL}/stream/start`,
  stopStream: `${API_BASE_URL}/stream/stop`,
  getStreamStatus: (streamId) => `${API_BASE_URL}/stream/${streamId}/status`,
  streamList: `${API_BASE_URL}/stream/list`,
  
  // Auth endpoints
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  authMe: `${API_BASE_URL}/auth/me`,
  logout: `${API_BASE_URL}/auth/logout`,
  updateProfile: `${API_BASE_URL}/auth/profile`,
};
