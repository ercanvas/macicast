<template>
  <div class="profile-container">
    <div class="profile-wrapper">
      <h2 class="text-2xl font-bold mb-6">Your Profile</h2>
      
      <div v-if="loading" class="text-center py-4">
        Loading...
      </div>
      
      <div v-else>
        <!-- Profile Info Display -->
        <div v-if="!isEditing" class="space-y-6">
          <div class="info-group">
            <h3 class="text-sm font-medium text-gray-500">Username</h3>
            <p class="text-lg">{{ user.username }}</p>
          </div>
          
          <div class="info-group">
            <h3 class="text-sm font-medium text-gray-500">Email</h3>
            <p class="text-lg">{{ user.email }}</p>
          </div>
          
          <div class="info-group">
            <h3 class="text-sm font-medium text-gray-500">Display Name</h3>
            <p class="text-lg">{{ user.displayName || user.username }}</p>
          </div>
          
          <div class="info-group">
            <h3 class="text-sm font-medium text-gray-500">Last Login</h3>
            <p class="text-lg">{{ formatDate(user.lastLogin) }}</p>
          </div>
          
          <!-- Edit button -->
          <div class="flex justify-between mt-8">
            <button 
              @click="isEditing = true" 
              class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
            
            <button 
              @click="isChangingPassword = true" 
              class="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
            >
              Change Password
            </button>
          </div>
        </div>
        
        <!-- Edit Profile Form -->
        <form v-if="isEditing" @submit.prevent="updateProfile" class="space-y-4">
          <div class="form-group">
            <label for="displayName" class="block text-sm font-medium mb-1">Display Name</label>
            <input 
              type="text" 
              id="displayName" 
              v-model="form.displayName" 
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div class="form-group">
            <label for="email" class="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="form.email" 
              class="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <!-- Error message -->
          <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
          
          <!-- Success message -->
          <div v-if="updateSuccess" class="text-green-500 text-sm mt-2">
            Profile updated successfully!
          </div>
          
          <!-- Form buttons -->
          <div class="flex justify-between mt-4">
            <button 
              type="submit" 
              class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              :disabled="formLoading"
            >
              Save Changes
              <span v-if="formLoading"> ...</span>
            </button>
            
            <button 
              type="button"
              @click="cancelEdit" 
              class="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
        
        <!-- Change Password Form -->
        <form v-if="isChangingPassword" @submit.prevent="changePassword" class="space-y-4">
          <div class="form-group">
            <label for="currentPassword" class="block text-sm font-medium mb-1">Current Password</label>
            <input 
              type="password" 
              id="currentPassword" 
              v-model="passwordForm.currentPassword" 
              class="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="newPassword" class="block text-sm font-medium mb-1">New Password</label>
            <input 
              type="password" 
              id="newPassword" 
              v-model="passwordForm.newPassword" 
              class="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="confirmPassword" class="block text-sm font-medium mb-1">Confirm New Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="passwordForm.confirmPassword" 
              class="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <!-- Error message -->
          <div v-if="passwordError" class="text-red-500 text-sm mt-2">{{ passwordError }}</div>
          
          <!-- Success message -->
          <div v-if="passwordSuccess" class="text-green-500 text-sm mt-2">
            Password changed successfully!
          </div>
          
          <!-- Form buttons -->
          <div class="flex justify-between mt-4">
            <button 
              type="submit" 
              class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              :disabled="passwordLoading"
            >
              Change Password
              <span v-if="passwordLoading"> ...</span>
            </button>
            
            <button 
              type="button"
              @click="cancelPasswordChange" 
              class="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

export default {
  name: 'UserProfile',
  
  setup() {
    const authStore = useAuthStore();
    const loading = ref(true);
    const error = ref('');
    const updateSuccess = ref(false);
    const isEditing = ref(false);
    const formLoading = ref(false);
    
    const isChangingPassword = ref(false);
    const passwordLoading = ref(false);
    const passwordError = ref('');
    const passwordSuccess = ref(false);
    
    const user = computed(() => authStore.currentUser || {});
    
    const form = reactive({
      displayName: '',
      email: ''
    });
    
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    onMounted(async () => {
      try {
        await authStore.fetchUserProfile();
      } catch (err) {
        error.value = 'Failed to load profile data';
      } finally {
        loading.value = false;
      }
    });
    
    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return 'Never';
      const date = new Date(dateString);
      return date.toLocaleString();
    };
    
    // Start editing - populate form with current data
    const startEdit = () => {
      form.displayName = user.value.displayName || '';
      form.email = user.value.email || '';
      isEditing.value = true;
    };
    
    // Cancel editing
    const cancelEdit = () => {
      isEditing.value = false;
      updateSuccess.value = false;
      error.value = '';
    };
    
    // Update profile
    const updateProfile = async () => {
      formLoading.value = true;
      error.value = '';
      updateSuccess.value = false;
      
      try {
        await authStore.updateProfile({
          displayName: form.displayName,
          email: form.email
        });
        
        updateSuccess.value = true;
        setTimeout(() => {
          isEditing.value = false;
          updateSuccess.value = false;
        }, 2000);
        
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to update profile';
      } finally {
        formLoading.value = false;
      }
    };
    
    // Cancel password change
    const cancelPasswordChange = () => {
      isChangingPassword.value = false;
      passwordSuccess.value = false;
      passwordError.value = '';
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
    };
    
    // Change password
    const changePassword = async () => {
      // Validation
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        passwordError.value = 'New passwords do not match';
        return;
      }
      
      if (passwordForm.newPassword.length < 6) {
        passwordError.value = 'Password must be at least 6 characters';
        return;
      }
      
      passwordLoading.value = true;
      passwordError.value = '';
      passwordSuccess.value = false;
      
      try {
        await authStore.changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        });
        
        passwordSuccess.value = true;
        
        // Reset form
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        
        // Auto-close after success
        setTimeout(() => {
          isChangingPassword.value = false;
          passwordSuccess.value = false;
        }, 2000);
        
      } catch (err) {
        passwordError.value = err.response?.data?.error || 'Failed to change password';
      } finally {
        passwordLoading.value = false;
      }
    };
    
    return {
      user,
      loading,
      error,
      updateSuccess,
      isEditing,
      formLoading,
      form,
      formatDate,
      startEdit,
      cancelEdit,
      updateProfile,
      
      isChangingPassword,
      passwordLoading,
      passwordError,
      passwordSuccess,
      passwordForm,
      cancelPasswordChange,
      changePassword
    };
  }
};
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 2rem 0;
}

.profile-wrapper {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.info-group {
  padding: 0.75rem 0;
  border-bottom: 1px solid #eaeaea;
}
</style> 