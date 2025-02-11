const isDev = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDev 
  ? 'http://localhost:3000/api'
  : 'https://macicast-backend.onrender.com/api';

export const MEDIA_BASE_URL = isDev
  ? 'http://localhost:3000'
  : 'https://macicast-backend.onrender.com';

export const endpoints = {
  upload: `${API_BASE_URL}/upload`,
  startStream: `${API_BASE_URL}/stream/start`,
  stopStream: `${API_BASE_URL}/stream/stop`,
  getStreams: `${API_BASE_URL}/stream/list`,
  channels: `${API_BASE_URL}/channels`,
  favorites: `${API_BASE_URL}/favorites`,
}
