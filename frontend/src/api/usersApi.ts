
import api from './axios';
import { ApiResponse, GetUsersParams } from '@/types/api';
import { User } from '@/types';

const usersApi = {
  // Только для админа: получение списка пользователей
  getUsers: (params: GetUsersParams = {}) => {
    return api.get<ApiResponse<{
      users: User[];
      totalCount: number;
    }>>('api/admin/users', { params });
  },
  
  // Только для админа: получение пользователя по ID
  getUserById: (_id: string) => {
    return api.get<ApiResponse<User>>(`api/admin/users/${_id}`);
  },
  
  // Только для админа: создание нового пользователя
  createUser: (data: { name: string; email: string; password: string; role: string }) => {
    return api.post<ApiResponse<User>>('api/admin/users', data);
  },
  
  // Только для админа: обновление существующего пользователя
  updateUser: (id: string, data: { name?: string; email?: string; password?: string; role?: string }) => {
    return api.put<ApiResponse<User>>(`api/admin/users/${id}`, data);
  },
  
  // Только для админа: удаление пользователя
  deleteUser: (id: string) => {
    return api.delete<ApiResponse<null>>(`api/admin/users/${id}`);
  },
};

export default usersApi;
