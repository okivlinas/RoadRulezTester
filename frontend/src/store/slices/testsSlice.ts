
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { testsApi } from '@/api';
import { GetTestsParams, TestRequest } from '@/types/api';
import { TestMode } from '@/types';

interface Test {
  _id: string;
  title: string;
  description: string;
  questionCount: number;
  mode: TestMode;
  imageBase64?: string;
}

interface TopicItem {
  _id: string;
  name: string;
}

interface TestsState {
  tests: Test[];
  totalCount: number;
  currentTest: Test | null;
  topics: TopicItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the interface for toast-only errors
interface ToastOnlyError {
  isToastOnly: true;
  message: string;
}

const initialState: TestsState = {
  tests: [],
  totalCount: 0,
  currentTest: null,
  topics: [],
  status: 'idle',
  error: null,
};

// Helper function to extract error message from API error
const extractErrorMessage = (error: any): string => {
  // Check for specific error patterns
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Неизвестная ошибка';
};

// Thunks
export const fetchTests = createAsyncThunk(
  'tests/fetchTests',
  async (params: GetTestsParams = {}, { rejectWithValue }) => {
    try {
      const response = await testsApi.getTests(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchTestById = createAsyncThunk(
  'tests/fetchTestById',
  async (_id: string, { rejectWithValue }) => {
    try {
      const response = await testsApi.getTestById(_id);
      return response.data.data as Test;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createTest = createAsyncThunk(
  'tests/createTest',
  async (testData: TestRequest, { rejectWithValue }) => {
    try {
      // Validate test data before sending to API
      if (!testData.title || testData.title.trim() === '') {
        return rejectWithValue('Название теста не может быть пустым');
      }
      
      const response = await testsApi.createTest(testData);
      return response.data;
    } catch (error: any) {
      // Handle specific error for duplicate test title
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
        if (errorMessage.includes('уже существует')) {
          return rejectWithValue({
            message: errorMessage,
            isToastOnly: true
          } as ToastOnlyError); // Explicitly cast to ToastOnlyError type
        }
      }
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateTest = createAsyncThunk(
  'tests/updateTest',
  async ({ _id, testData }: { _id: string; testData: TestRequest }, { rejectWithValue }) => {
    try {
      // Validate test data before sending to API
      if (!testData.title || testData.title.trim() === '') {
        return rejectWithValue('Название теста не может быть пустым');
      }
      
      const response = await testsApi.updateTest(_id, testData);
      return response.data;
    } catch (error: any) {
      // Handle specific error for duplicate test title
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
        if (errorMessage.includes('уже существует')) {
          return rejectWithValue({
            message: errorMessage,
            isToastOnly: true
          } as ToastOnlyError); // Explicitly cast to ToastOnlyError type
        }
      }
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteTest = createAsyncThunk(
  'tests/deleteTest',
  async (_id: string, { rejectWithValue }) => {
    try {
      await testsApi.deleteTest(_id);
      return _id;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchTopics = createAsyncThunk(
  'tests/fetchTopics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await testsApi.getTopics();
      return response.data.data as TopicItem[];
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const testsSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    resetTestsStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    setCurrentTest: (state, action: PayloadAction<Test | null>) => {
      state.currentTest = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get tests list
    builder
      .addCase(fetchTests.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.tests = Array.isArray(action.payload.items) 
            ? action.payload.items.map((test: any) => ({
                ...test,
                mode: test.mode as TestMode,
                // Ensure all required fields are present and have default values if needed
                title: test.title || '',
                description: test.description || '',
                questionCount: typeof test.questionCount === 'number' ? test.questionCount : 0,
                // Ensure imageBase64 is properly set
                imageBase64: test.imageBase64 || undefined
              }))
            : [];
          state.totalCount = typeof action.payload.totalCount === 'number' ? action.payload.totalCount : 0;
        }
        else {
          state.tests = [];
          state.totalCount = 0;
        }
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Get test by ID
    builder
      .addCase(fetchTestById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTestById.fulfilled, (state, action: PayloadAction<Test>) => {
        state.status = 'succeeded';
        // Ensure imageBase64 is properly set when fetching a single test
        state.currentTest = {
          ...action.payload,
          imageBase64: action.payload.imageBase64 || undefined
        };
      })
      .addCase(fetchTestById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Create test
    builder
      .addCase(createTest.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createTest.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.tests.push(action.payload);
        state.totalCount += 1;
      })
      .addCase(createTest.rejected, (state, action) => {
        // Only set failed state if it's not a toast-only error
        if (action.payload && typeof action.payload === 'object' && 'isToastOnly' in action.payload) {
          state.status = 'succeeded'; // Don't change the overall state
        } else {
          state.status = 'failed';
          state.error = typeof action.payload === 'string' ? action.payload : 'Произошла ошибка при создании теста';
        }
      });

    // Update test
    builder
      .addCase(updateTest.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateTest.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        const index = state.tests.findIndex((test) => test._id === action.payload._id);
        if (index !== -1) {
          state.tests[index] = action.payload;
        }
        if (state.currentTest?._id === action.payload._id) {
          state.currentTest = action.payload;
        }
      })
      .addCase(updateTest.rejected, (state, action) => {
        // Only set failed state if it's not a toast-only error
        if (action.payload && typeof action.payload === 'object' && 'isToastOnly' in action.payload) {
          state.status = 'succeeded'; // Don't change the overall state
        } else {
          state.status = 'failed';
          state.error = typeof action.payload === 'string' ? action.payload : 'Произошла ошибка при обновлении теста';
        }
      });

    // Delete test
    builder
      .addCase(deleteTest.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteTest.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.tests = state.tests.filter((test) => test._id !== action.payload);
        state.totalCount -= 1;
        if (state.currentTest?._id === action.payload) {
          state.currentTest = null;
        }
      })
      .addCase(deleteTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Get topics
    builder
      .addCase(fetchTopics.fulfilled, (state, action: PayloadAction<TopicItem[]>) => {
        state.topics = action.payload;
      });
  },
});

export const { resetTestsStatus, setCurrentTest } = testsSlice.actions;
export default testsSlice.reducer;
