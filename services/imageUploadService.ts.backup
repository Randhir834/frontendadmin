import api from './api';

export const imageUploadService = {
  uploadImage: async (file: File, uploadPath: string = 'images') => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/upload/${uploadPath}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  deleteImage: async (imageUrl: string) => {
    const response = await api.delete('/upload/image', {
      data: { imageUrl },
    });
    
    return response.data;
  },
};
