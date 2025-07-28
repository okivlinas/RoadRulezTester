/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';
import { LoginRequest, RegisterRequest } from '@/types/api';
import { API_CONFIG } from '@/api/config';

// Check server connectivity
export const checkServerConnectivity = async () => {
  const API_URL = API_CONFIG.baseURL;
  console.log('🔍 Проверка доступности сервера...');
  
  try {
    // Try to make a simple request to check if the server is accessible
    console.log(`🔍 Проверка доступности ${API_URL}/health`);
    const response = await axios.get(`${API_URL}/api/auth/health`, { timeout: 3000 });
    console.log('✅ Сервер доступен:', response.data);
    return true;
  } catch (error: any) {
    if (!error.response) {
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.error('❌ Сетевая ошибка: Сервер недоступен. Проверьте, запущен ли бэкенд-сервер.');
        console.error(`❌ Попробуйте открыть ${API_URL} в браузере, чтобы убедиться, что сервер работает.`);
      } else if (error.code === 'ECONNABORTED') {
        console.error('❌ Timeout: Сервер не ответил вовремя.');
      } else {
        console.error('❌ Неизвестная ошибка:', error.message);
      }
    } else {
      // Server responded with an error status
      console.error('❌ Сервер ответил с ошибкой:', error.response.status, error.response.data);
    }
    return false;
  }
};

// Функция для тестирования запросов аутентификации
export const testAuthRequests = async () => {
  try {
    console.log('🔍 Тестируем запросы аутентификации...');
    
    // Сначала проверим доступность сервера
    const isServerAccessible = await checkServerConnectivity();
    if (!isServerAccessible) {
      console.error('❌ Тестирование API невозможно - сервер недоступен');
      return;
    }
    
    // Получаем базовый URL из конфигурации
    const API_URL = API_CONFIG.baseURL;
    
    // Тест запроса на регистрацию
    console.log(`📤 Тестовый запрос регистрации на ${API_URL}/api/auth/register`);
    const testRegister: RegisterRequest = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    try {
      await axios.options(`${API_URL}/api/auth/register`);
      console.log('✅ Предполетный CORS запрос на регистрацию успешен');
    } catch (error) {
      console.error('❌ Предполетный CORS запрос на регистрацию не прошел:', error);
    }
    
    // Тест запроса на вход
    console.log(`📤 Тестовый запрос входа на ${API_URL}/api/auth/login`);
    const testLogin: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    try {
      await axios.options(`${API_URL}/api/auth/login`);
      console.log('✅ Предполетный CORS запрос на вход успешен');
    } catch (error) {
      console.error('❌ Предполетный CORS запрос на вход не прошел:', error);
    }
    
    // Тест запроса к случайным вопросам
    console.log(`📤 Тестовый запрос на получение случайных вопросов ${API_URL}/api/questions/random?count=5`);
    try {
      await axios.options(`${API_URL}/api/questions/random?count=5`);
      console.log('✅ Предполетный CORS запрос на получение случайных вопросов успешен');
      
      // Попробуем сделать фактический GET запрос
      try {
        const response = await axios.get(`${API_URL}/api/questions/random?count=5`, { timeout: 5000 });
        console.log('✅ GET запрос на получение случайных вопросов успешен:', response.data);
      } catch (error: any) {
        console.error('❌ GET запрос на получение случайных вопросов не прошел:', error.message);
        if (error.response) {
          console.error('Статус ответа:', error.response.status);
          console.error('Данные ответа:', error.response.data);
        }
      }
    } catch (error) {
      console.error('❌ Предполетный CORS запрос на получение случайных вопросов не прошел:', error);
    }
    
    console.log('🔍 Тестирование завершено');
  } catch (error) {
    console.error('❌ Ошибка при тестировании API:', error);
  }
};

// Вызвать тесты API сразу при импорте этого модуля
setTimeout(() => {
  console.log('🚀 Запуск автоматической диагностики API соединения...');
  checkServerConnectivity();
}, 1000);
