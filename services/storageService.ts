import api from './api';

export const storageService = {
  uploadFile: async (file: File, folder: string = 'uploads'): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  deleteFile: async (url: string): Promise<void> => {
    await api.delete('/storage/delete', {
      data: { url },
    });
  },
};
