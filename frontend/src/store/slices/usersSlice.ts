/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usersApi } from '@/api';
import { GetUsersParams } from '@/types/api';
import { User } from '@/types';

interface UsersState {
  users: User[];
  totalCount: number;
  selectedUser: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  totalCount: 0,
  selectedUser: null,
  status: 'idle',
  error: null,
};

// Thunks (только для админа)
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: GetUsersParams = {}, { rejectWithValue }) => {
    try {
      const response = await usersApi.getUsers(params);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось загрузить пользователей';
      return rejectWithValue(message);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await usersApi.getUserById(id);
      return response.data.data as User;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось загрузить пользователя';
      return rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: { name: string; email: string; password: string; role: string }, { rejectWithValue }) => {
    try {
      const response = await usersApi.createUser(userData);
      return response.data.data as User;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось создать пользователя';
      return rejectWithValue(message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ _id, userData }: { _id: string; userData: { name?: string; email?: string; password?: string; role?: string } }, { rejectWithValue }) => {
    try {
      const response = await usersApi.updateUser(_id, userData);
      return response.data.data as User;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось обновить пользователя';
      return rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await usersApi.deleteUser(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось удалить пользователя';
      return rejectWithValue(message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetUsersStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Получение списка пользователей
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<{ users: User[]; totalCount: number }>) => {
        state.status = 'succeeded';
        state.users = action.payload.users;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Получение пользователя по ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Создание пользователя
    builder
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.users.push(action.payload);
        state.totalCount += 1;
      });

    // Обновление пользователя
    builder
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = action.payload;
        }
      });

    // Удаление пользователя
    builder
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter(user => user._id !== action.payload);
        state.totalCount -= 1;
        if (state.selectedUser?._id === action.payload) {
          state.selectedUser = null;
        }
      });
  },
});

export const { resetUsersStatus, setSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;
