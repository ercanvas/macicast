import axios from 'axios';

// Get the API URL from environment variables or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AUTH_ENDPOINT = `${API_URL}/api/users`;

// Create axios instance with authorization header
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request if it exists
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await axios.post(`${AUTH_ENDPOINT}/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  // Login user
  login: async (credentials) => {
    const response = await axios.post(`${AUTH_ENDPOINT}/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Get current user info
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },
  
  // Get user profile from server
  getUserProfile: async () => {
    const response = await authAxios.get(`${AUTH_ENDPOINT}/me`);
    return response.data;
  },
  
  // Update user profile
  updateProfile: async (userData) => {
    const response = await authAxios.put(`${AUTH_ENDPOINT}/me`, userData);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  // Change password
  changePassword: async (passwordData) => {
    const response = await authAxios.post(`${AUTH_ENDPOINT}/change-password`, passwordData);
    return response.data;
  }
};

export default authService; 