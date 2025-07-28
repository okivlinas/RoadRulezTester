
import api from './axios';
import { ApiResponse, SaveResultRequest, GetStatsParams } from '@/types/api';
import { TestResult, UserStats, TestMode } from '@/types';

const resultsApi = {
  // Получение результатов тестов текущего пользователя
  getUserResults: (params: { page?: number; limit?: number } = {}) => {
    return api.get<ApiResponse<{
      results: TestResult[];
      totalCount: number;
    }>>('/results', { params });
  },
  
  // Получение результата теста по ID
  getResultById: (id: string) => {
    return api.get<ApiResponse<TestResult>>(`/results/${id}`);
  },
  
  // Получение последнего результата теста пользователя
  getLatestResult: (mode?: TestMode) => {
    console.log("API call - getLatestResult with mode:", mode);
    return api.get<ApiResponse<TestResult>>('/results/latest', { 
      params: mode ? { mode } : {} 
    });
  },
  
  // Сохранение результата теста
  saveResult: (data: SaveResultRequest) => {
    return api.post<ApiResponse<TestResult>>('/results', data);
  },
  
  // Получение статистики пользователя
  getUserStats: (params: GetStatsParams = {}) => {
    return api.get<ApiResponse<UserStats>>('/results/stats', { params });
  },
  
  // Для админа: получение статистики по всем пользователям
  getAllStats: () => {
    return api.get<ApiResponse<{
      totalTests: number;
      averageScore: number;
      passRate: number;
    }>>('/admin/results/stats');
  },
};

export default resultsApi;
