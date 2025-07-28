
/* eslint-disable @typescript-eslint/no-explicit-any */

import api from './axios';
import axios from 'axios';
import { ApiResponse, GetQuestionsParams, QuestionRequest } from '@/types/api';
import { Question } from '@/types';
import { API_CONFIG } from './config';

const questionsApi = {
  // Получение списка вопросов
  getQuestions: (params: GetQuestionsParams = {}) => {
    return api.get<ApiResponse<{
      questions: Question[];
      totalCount: number;
    }>>('api/questions', { params });
  },
  
  // Получение вопроса по ID
  getQuestionById: (id: string) => {
    return api.get<ApiResponse<Question>>(`api/questions/${id}`);
  },
  
  // Получение вопросов для теста
  getQuestionsForTest: (testId: string, count: number) => {
    return api.get<ApiResponse<Question[]>>(`api/tests/${testId}/questions`, {
      params: { count }
    });
  },
  
  // Получение случайных вопросов для практики с расширенной обработкой ошибок
  getRandomQuestions: async (count: number) => {
    try {
      const response = await api.get<ApiResponse<any[]>>('api/questions/random', {
        params: { count: count }
      });
      return response.data.data;
    } catch (error: any) {
      // Попробуем прямой запрос через axios для диагностики
      try {
        const directResponse = await axios.get(
          `${API_CONFIG.baseURL}/api/questions/random?count=${count}`,
          { timeout: 5000 }
        );
      } catch (directError: any) {
        console.error('❌ Прямой запрос также не удался:', directError.message);
        if (directError.response) {
          console.error('Статус ответа:', directError.response.status);
          console.error('Данные ответа:', directError.response.data);
        } else {
          console.error('Тип ошибки:', directError.code || 'неизвестно');
          console.error('Полная ошибка:', directError);
        }
      }
      
      throw error; // Пробросим исходную ошибку дальше
    }
  },
  
  // Создание нового вопроса
  createQuestion: (data: QuestionRequest) => {
    return api.post<ApiResponse<Question>>('api/questions', data);
  },
  
  // Обновление существующего вопроса
  updateQuestion: (id: string, data: QuestionRequest) => {
    return api.put<ApiResponse<Question>>(`api/questions/${id}`, data);
  },
  
  // Удаление вопроса
  deleteQuestion: (id: string) => {
    return api.delete<ApiResponse<null>>(`api/questions/${id}`);
  },
  
  // Загрузка изображения для вопроса
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return api.post<ApiResponse<{url: string}>>('api/questions/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Получение вопросов по теме/тесту
  getQuestionsByTest: (testId: string) => {
    return api.get<ApiResponse<{
      questions: Question[];
      totalCount: number;
    }>>(`api/tests/${testId}/questions/all`);
  },
};

export default questionsApi;
