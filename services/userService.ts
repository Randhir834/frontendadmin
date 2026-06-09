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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },
};
