import api from './axios';
import { ApiResponse, GetTestsParams, TestRequest, TestsResponse } from '@/types/api';
import { TestMode } from '@/types';
import { getFileUploadConfig } from './config';

const testsApi = {
  // Получение списка тестов
  getTests: (params: GetTestsParams = {}) => {
    return api.get<ApiResponse<TestsResponse>>('api/tests', { params });
  },
  
  // Получение теста по ID
  getTestById: (_id: string) => {
    return api.get<ApiResponse<TestsResponse['tests'][0]>>(`api/tests/${_id}`);
  },
  
  // Создание нового теста
  createTest: (data: TestRequest) => {
    // Now sending imageBase64 in the request body if available
    return api.post<ApiResponse<TestsResponse['tests'][0]>>('api/tests', data);
  },
  
  // Обновление существующего теста
  updateTest: (_id: string, data: TestRequest) => {
    // Now sending imageBase64 in the request body if available
    return api.put<ApiResponse<TestsResponse['tests'][0]>>(`api/tests/${_id}`, data);
  },
  
  // Удаление теста
  deleteTest: (_id: string) => {
    return api.delete<ApiResponse<null>>(`api/tests/${_id}`);
  },
  
  // Получение тем для тематических тестов
  getTopics: () => {
    return api.get<ApiResponse<{_id: string, name: string}[]>>('api/tests/topics');
  },
  
  // Загрузка изображения для теста
  uploadTestImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return api.post<ApiResponse<{url: string}>>('api/tests/upload-image', formData, getFileUploadConfig());
  },
  
  // Удаление изображения теста
  deleteTestImage: (imageBase64: string) => {
    return api.post<ApiResponse<null>>('api/tests/delete-image', { imageBase64 });
  },
};

export default testsApi;
