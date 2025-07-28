
/* eslint-disable @typescript-eslint/no-explicit-any */

import { authApi, testsApi, questionsApi, resultsApi, usersApi } from '@/api';
import { handleApiError } from '@/api/config';
import { UploadService } from './upload.service';

/**
 * Centralized API service that wraps all API calls
 * and provides consistent error handling
 */
export const ApiService = {
  auth: {
    login: async (email: string, password: string) => {
      try {
        const response = await authApi.login({ email, password });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    register: async (name: string, email: string, password: string) => {
      try {
        const response = await authApi.register({ name, email, password });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    logout: async () => {
      try {
        await authApi.logout();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Logout error:', handleApiError(error));
        // Still remove local data even if API call fails
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    
    getCurrentUser: async () => {
      try {
        const response = await authApi.getCurrentUser();
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    updateProfile: async (userData: any) => {
      try {
        const response = await authApi.updateProfile(userData);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  },
  
  tests: {
    getTests: async (params = {}) => {
      try {
        const response = await testsApi.getTests(params);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    getTestById: async (id: string) => {
      try {
        const response = await testsApi.getTestById(id);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    createTest: async (testData: any) => {
      try {
        const response = await testsApi.createTest(testData);
        return response.data.data;
      } catch (error: any) {
        // Проверяем наличие ошибки дубликата
        if (error.response?.status === 400 && error.response?.data?.error?.includes('уже существует')) {
          throw new Error(`Тест с названием "${testData.title}" уже существует.`);
        }
        throw new Error(handleApiError(error));
      }
    },
    
    updateTest: async (id: string, testData: any) => {
      try {
        const response = await testsApi.updateTest(id, testData);
        return response.data.data;
      } catch (error: any) {
        // Проверяем наличие ошибки дубликата
        if (error.response?.status === 400 && error.response?.data?.error?.includes('уже существует')) {
          throw new Error(`Тест с названием "${testData.title}" уже существует.`);
        }
        throw new Error(handleApiError(error));
      }
    },
    
    deleteTest: async (id: string) => {
      try {
        await testsApi.deleteTest(id);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    getTopics: async () => {
      try {
        const response = await testsApi.getTopics();
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  },
  
  questions: {
    getQuestions: async (params = {}) => {
      try {
        const response = await questionsApi.getQuestions(params);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    getQuestionsForTest: async (testId: string, count: number) => {
      try {
        const response = await questionsApi.getQuestionsForTest(testId, count);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    getQuestionById: async (id: string) => {
      try {
        const response = await questionsApi.getQuestionById(id);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    createQuestion: async (questionData: any) => {
      try {
        // Now including testId for topic/test association
        const response = await questionsApi.createQuestion(questionData);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    updateQuestion: async (id: string, questionData: any) => {
      try {
        // Now including testId for topic/test association
        const response = await questionsApi.updateQuestion(id, questionData);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    deleteQuestion: async (id: string) => {
      try {
        await questionsApi.deleteQuestion(id);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    uploadQuestionImage: async (file: File) => {
      try {
        const response = await questionsApi.uploadImage(file);
        return response.data.data.url;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    // Add new method to get all questions for a specific test
    getQuestionsByTest: async (testId: string) => {
      try {
        const response = await questionsApi.getQuestionsByTest(testId);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  },
  
  results: {
    getUserResults: async (params = {}) => {
      try {
        const response = await resultsApi.getUserResults(params);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    saveResult: async (resultData: any) => {
      try {
        const response = await resultsApi.saveResult(resultData);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },
  
  users: {
    getUsers: async (params = {}) => {
      try {
        const response = await usersApi.getUsers(params);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    getUserById: async (id: string) => {
      try {
        const response = await usersApi.getUserById(id);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    createUser: async (userData: any) => {
      try {
        const response = await usersApi.createUser(userData);
        return response.data.data;
      } catch (error: any) {
        // Проверяем, является ли ошибка дубликатом email (код 409)
        if (error.response?.status === 409) {
          throw new Error('Пользователь с таким email уже существует');
        }
        throw new Error(handleApiError(error));
      }
    },
    
    updateUser: async (id: string, userData: any) => {
      try {
        const response = await usersApi.updateUser(id, userData);
        return response.data.data;
      } catch (error: any) {
        // Проверяем, является ли ошибка дубликатом email (код 409)
        if (error.response?.status === 409) {
          throw new Error('Пользователь с таким email уже существует');
        }
        throw new Error(handleApiError(error));
      }
    },
    
    deleteUser: async (id: string) => {
      try {
        await usersApi.deleteUser(id);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  },
  
  upload: {
    uploadImage: async (file: File, path: string = 'images') => {
      try {
        return await UploadService.uploadImage(file, path);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    
    deleteImage: async (imageBase64: string) => {
      try {
        await UploadService.deleteImage(imageBase64);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  }
};
