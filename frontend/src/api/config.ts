
/* eslint-disable @typescript-eslint/no-explicit-any */

// API Configuration
const API_URL = 'http://localhost:3001';

export const API_CONFIG = {
  baseURL: `${API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper functions for API responses
export const handleApiResponse = <T>(data: any): T => {
  // You can add additional response processing logic here if needed
  return data;
};

export const handleApiError = (error: any): string => {
  // Handle network errors (offline, server not running)
  if (!error.response) {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      return 'Невозможно подключиться к серверу. Проверьте подключение к интернету и работает ли сервер.';
    }
    return error.message || 'Произошла неизвестная ошибка';
  }
  
  if (error.response) {
    // Server responded with a status code outside of 2xx range
    return error.response.data?.error || 'Произошла ошибка при выполнении запроса';
  } else if (error.request) {
    // Request was made but no response was received
    return 'Сервер недоступен. Проверьте подключение к интернету.';
  } else {
    // Something happened in setting up the request
    return error.message || 'Произошла неизвестная ошибка';
  }
};

// Server health check function
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/health`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch (error) {
    console.error('❌ Server health check failed:', error);
    return false;
  }
};

// Configuration for file uploads
export const getFileUploadConfig = () => ({
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// JWT Token Helpers
export const getJwtToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setJwtToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeJwtToken = (): void => {
  localStorage.removeItem('token');
};

// Base64 image helper functions
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const isBase64Image = (str: string): boolean => {
  return /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(str);
};
