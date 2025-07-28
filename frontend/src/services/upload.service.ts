
import api from '@/api/axios';
import { FileUploadResponse } from '@/types/api';
import { getFileUploadConfig } from '@/api/config';

/**
 * Сервис для загрузки файлов
 */
export const UploadService = {
  /**
   * Загружает изображение на сервер
   * @param file Файл изображения
   * @param path Путь для сохранения (опционально)
   * @returns Promise с URL загруженного изображения
   */
  uploadImage: async (file: File, path: string = 'tests'): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('path', path);
      
      const response = await api.post<{
        success: boolean;
        data: FileUploadResponse;
      }>('api/upload/image', formData, getFileUploadConfig());
      
      if (!response.data.success) {
        throw new Error('Ошибка при загрузке изображения');
      }
      
      return response.data.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Не удалось загрузить изображение');
    }
  },
  
  /**
   * Удаляет изображение с сервера
   * @param imageBase64 URL изображения для удаления
   */
  deleteImage: async (imageBase64: string): Promise<void> => {
    try {
      const fileName = imageBase64.split('/').pop();
      if (!fileName) throw new Error('Неверный URL изображения');
      
      await api.delete(`api/upload/image/${fileName}`);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Не удалось удалить изображение');
    }
  }
};
