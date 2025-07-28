
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { resultsApi } from '@/api';
import { SaveResultRequest, GetStatsParams } from '@/types/api';
import { TestResult, UserStats, TestMode } from '@/types';

interface ResultsState {
  results: TestResult[];
  totalCount: number;
  currentResult: TestResult | null;
  latestResult: TestResult | null;
  userStats: UserStats | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ResultsState = {
  results: [],
  totalCount: 0,
  currentResult: null,
  latestResult: null,
  userStats: null,
  status: 'idle',
  error: null,
};

// Thunks
export const fetchUserResults = createAsyncThunk(
  'results/fetchUserResults',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await resultsApi.getUserResults(params);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось загрузить результаты';
      return rejectWithValue(message);
    }
  }
);

export const fetchResultById = createAsyncThunk(
  'results/fetchResultById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await resultsApi.getResultById(id);
      return response.data.data as TestResult;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось загрузить результат';
      return rejectWithValue(message);
    }
  }
);

export const fetchLatestResult = createAsyncThunk(
  'results/fetchLatestResult',
  async (mode: TestMode | undefined, { rejectWithValue }) => {
    try {
      console.log("Fetching latest result for mode:", mode);
      const response = await resultsApi.getLatestResult(mode);
      console.log("Latest result response:", response.data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось загрузить последний результат';
      return rejectWithValue(message);
    }
  }
);

export const saveResult = createAsyncThunk(
  'results/saveResult',
  async (resultData: SaveResultRequest, { rejectWithValue }) => {
    try {
      const response = await resultsApi.saveResult(resultData);
      return response.data.data as TestResult;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось сохранить результат';
      return rejectWithValue(message);
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'results/fetchUserStats',
  async (params: GetStatsParams = {}, { rejectWithValue }) => {
    try {
      const response = await resultsApi.getUserStats(params);
      return response.data.data as UserStats;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось загрузить статистику';
      return rejectWithValue(message);
    }
  }
);

const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    resetResultsStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    setCurrentResult: (state, action: PayloadAction<TestResult | null>) => {
      state.currentResult = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Получение результатов пользователя
    builder
      .addCase(fetchUserResults.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserResults.fulfilled, (state, action: PayloadAction<{ results: TestResult[]; totalCount: number }>) => {
        state.status = 'succeeded';
        state.results = action.payload.results;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchUserResults.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Получение результата по ID
    builder
      .addCase(fetchResultById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchResultById.fulfilled, (state, action: PayloadAction<TestResult>) => {
        state.status = 'succeeded';
        state.currentResult = action.payload;
      })
      .addCase(fetchResultById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
      
    // Получение последнего результата
    builder
      .addCase(fetchLatestResult.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLatestResult.fulfilled, (state, action: any) => {
        state.status = 'succeeded';
        state.latestResult = action.payload || null;
      })
      .addCase(fetchLatestResult.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Сохранение результата теста
    builder
      .addCase(saveResult.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveResult.fulfilled, (state, action: PayloadAction<TestResult>) => {
        state.status = 'succeeded';
        state.currentResult = action.payload;
        state.latestResult = action.payload;
        state.results.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(saveResult.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Получение статистики пользователя
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserStats.fulfilled, (state, action: PayloadAction<UserStats>) => {
        state.status = 'succeeded';
        state.userStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetResultsStatus, setCurrentResult } = resultsSlice.actions;
export default resultsSlice.reducer;
