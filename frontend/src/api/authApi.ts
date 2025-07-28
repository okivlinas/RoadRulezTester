
import api from './axios';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest } from '@/types/api';
import { removeJwtToken } from './config';

const authApi = {
  // Авторизация пользователя
  login: (data: LoginRequest) => {
    return api.post<ApiResponse<AuthResponse>>('api/auth/login', data);
  },

  // Регистрация нового пользователя
  register: (data: RegisterRequest) => {
    return api.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
  },

  // Выход из системы
  logout: () => {
    removeJwtToken();
    return api.post<ApiResponse<null>>('/api/auth/logout');
  },

  // Получение данных текущего пользователя
  getCurrentUser: () => {
    return api.get<ApiResponse<AuthResponse['user']>>('api/auth/me');
  },

  // Обновление профиля пользователя
  updateProfile: (data: UpdateProfileRequest) => {
    return api.put<ApiResponse<AuthResponse['user']>>('/api/auth/profile', data);
  }
};

export default authApi;
