import { defineStore } from 'pinia';
import authService from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: authService.getCurrentUser(),
    isAuthenticated: authService.isLoggedIn(),
    loading: false,
    error: null
  }),
  
  getters: {
    // Get current user
    currentUser: (state) => state.user,
    
    // Check if user is admin
    isAdmin: (state) => state.user && state.user.isAdmin,
    
    // Check if authentication is loading
    isLoading: (state) => state.loading,
    
    // Get error message
    getError: (state) => state.error
  },
  
  actions: {
    // Set authenticated user
    setUser(user) {
      this.user = user;
      this.isAuthenticated = !!user;
    },
    
    // Clear error
    clearError() {
      this.error = null;
    },
    
    // Register a new user
    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const data = await authService.register(userData);
        this.setUser(data.user);
        return data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Login user
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const data = await authService.login(credentials);
        this.setUser(data.user);
        return data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Logout user
    logout() {
      authService.logout();
      this.setUser(null);
    },
    
    // Update user profile
    async updateProfile(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const data = await authService.updateProfile(userData);
        this.setUser(data.user);
        return data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Profile update failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Change password
    async changePassword(passwordData) {
      this.loading = true;
      this.error = null;
      
      try {
        const data = await authService.changePassword(passwordData);
        return data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Password change failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Fetch current user data from server
    async fetchUserProfile() {
      if (!this.isAuthenticated) return null;
      
      this.loading = true;
      this.error = null;
      
      try {
        const userData = await authService.getUserProfile();
        this.setUser(userData);
        return userData;
      } catch (error) {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.logout();
        }
        this.error = error.response?.data?.error || 'Failed to fetch user data';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 