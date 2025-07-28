
import axios from 'axios';
import { API_CONFIG, getJwtToken } from './config';
import { toast } from '@/components/ui/use-toast';

// Create axios instance with configuration
const api = axios.create(API_CONFIG);

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = getJwtToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log request for debugging
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors (offline, server not running)
    if (!error.response) {
      console.error('❌ Network Error:', error.message);
      
      // Check if it's a network disconnection error
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.message.includes('disconnected')) {
        toast({
          title: "Ошибка подключения",
          description: "Невозможно подключиться к серверу. Проверьте подключение к интернету и работает ли сервер.",
          variant: "destructive"
        });
        
        return Promise.reject({
          ...error,
          friendlyMessage: "Невозможно подключиться к серверу. Проверьте подключение к интернету и работает ли сервер."
        });
      }
      
      return Promise.reject(error);
    }
    
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
    
    // Handle server errors
    if (error.response && error.response.status >= 500) {
      console.error('❌ Server error:', error.response.data);
    }
    
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error);
    
    return Promise.reject(error);
  }
);

export default api;
