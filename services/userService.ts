import api from './api';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/users/profile');
    return response.data.user;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put('/users/profile', data);
    return response.data.user;
  },

  changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    const response = await api.post('/users/change-password', {
      oldPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  uploadProfilePhoto: async (file: File): Promise<{ avatar_url: string; user: UserProfile }> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post('/users/profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProfilePhoto: async (): Promise<{ user: UserProfile }> => {
    const response = await api.delete('/users/profile-photo');
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      // Clear all authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionToken');
      sessionStorage.removeItem('auth_session');
      
      // Set logout flag to prevent bfcache access
      sessionStorage.setItem('logout_initiated', 'true');
      
      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
      
      // Dispatch custom event for other components
      window.dispatchEvent(new Event('auth:logout'));
      
      // Use window.location.href with cache-busting to force full page reload
      // This prevents bfcache from restoring the previous page
      window.location.href = `/login?logout=${Date.now()}`;
    }
  },
};
