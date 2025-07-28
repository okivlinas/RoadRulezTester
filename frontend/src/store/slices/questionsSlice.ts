/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { questionsApi } from '@/api';
import { GetQuestionsParams, QuestionRequest } from '@/types/api';
import { Question } from '@/types';

interface QuestionsState {
  questions: Question[];
  totalCount: number;
  currentQuestion: Question | null;
  quizQuestions: Question[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: QuestionsState = {
  questions: [],
  totalCount: 0,
  currentQuestion: null,
  quizQuestions: [],
  status: 'idle',
  error: null,
};

// Thunks
export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async (params: GetQuestionsParams = {}, { rejectWithValue }) => {
    try {
      const response = await questionsApi.getQuestions(params);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось загрузить вопросы';
      return rejectWithValue(message);
    }
  }
);

export const fetchQuestionById = createAsyncThunk(
  'questions/fetchQuestionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await questionsApi.getQuestionById(id);
      return response.data.data as Question;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось загрузить вопрос';
      return rejectWithValue(message);
    }
  }
);

export const fetchQuestionsForTest = createAsyncThunk(
  'questions/fetchQuestionsForTest',
  async ({ testId, count }: { testId: string; count: number }, { rejectWithValue }) => {
    try {
      const response = await questionsApi.getQuestionsForTest(testId, count);
      return response.data.data as Question[];
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось загрузить вопросы для теста';
      return rejectWithValue(message);
    }
  }
);

export const fetchRandomQuestions = createAsyncThunk(
  'questions/fetchRandomQuestions',
  async (count: number, { rejectWithValue }) => {
    try {
      const response = await questionsApi.getRandomQuestions(count);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось загрузить случайные вопросы';
      return rejectWithValue(message);
    }
  }
);

export const createQuestion = createAsyncThunk(
  'questions/createQuestion',
  async (questionData: QuestionRequest, { rejectWithValue }) => {
    try {
      const response = await questionsApi.createQuestion(questionData);
      return response.data.data as Question;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось создать вопрос';
      return rejectWithValue(message);
    }
  }
);

export const updateQuestion = createAsyncThunk(
  'questions/updateQuestion',
  async ({ id, questionData }: { id: string; questionData: QuestionRequest }, { rejectWithValue }) => {
    try {
      const response = await questionsApi.updateQuestion(id, questionData);
      return response.data.data as Question;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось обновить вопрос';
      return rejectWithValue(message);
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  'questions/deleteQuestion',
  async (id: string, { rejectWithValue }) => {
    try {
      await questionsApi.deleteQuestion(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось удалить вопрос';
      return rejectWithValue(message);
    }
  }
);

export const uploadQuestionImage = createAsyncThunk(
  'questions/uploadImage',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await questionsApi.uploadImage(file);
      return response.data.data?.url;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Не удалось загрузить изображение';
      return rejectWithValue(message);
    }
  }
);

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    resetQuestionsStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    setCurrentQuestion: (state, action: PayloadAction<Question | null>) => {
      state.currentQuestion = action.payload;
    },
    clearQuizQuestions: (state) => {
      state.quizQuestions = [];
    },
  },
  extraReducers: (builder) => {
    // Получение списка вопросов
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuestions.fulfilled, (state, action: PayloadAction<{ questions: Question[]; totalCount: number }>) => {
        state.status = 'succeeded';
        state.questions = action.payload.questions;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Получение вопроса по ID
    builder
      .addCase(fetchQuestionById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuestionById.fulfilled, (state, action: PayloadAction<Question>) => {
        state.status = 'succeeded';
        state.currentQuestion = action.payload;
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Получение вопросов для теста
    builder
      .addCase(fetchQuestionsForTest.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuestionsForTest.fulfilled, (state, action: PayloadAction<Question[]>) => {
        state.status = 'succeeded';
        state.quizQuestions = action.payload;
      })
      .addCase(fetchQuestionsForTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Получение случайных вопросов
    builder
      .addCase(fetchRandomQuestions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRandomQuestions.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.status = 'succeeded';
        state.quizQuestions = action.payload;
      })
      .addCase(fetchRandomQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Создание вопроса
    builder
      .addCase(createQuestion.fulfilled, (state, action: PayloadAction<Question>) => {
        state.questions.push(action.payload);
        state.totalCount += 1;
      });

    // Обновление вопроса
    builder
      .addCase(updateQuestion.fulfilled, (state, action: PayloadAction<Question>) => {
        const index = state.questions.findIndex((question) => question._id === action.payload._id);
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
        if (state.currentQuestion?._id === action.payload._id) {
          state.currentQuestion = action.payload;
        }
      });

    // Удаление вопроса
    builder
      .addCase(deleteQuestion.fulfilled, (state, action: PayloadAction<string>) => {
        state.questions = state.questions.filter((question) => question._id !== action.payload);
        state.totalCount -= 1;
        if (state.currentQuestion?._id === action.payload) {
          state.currentQuestion = null;
        }
      });
  },
});

export const { resetQuestionsStatus, setCurrentQuestion, clearQuizQuestions } = questionsSlice.actions;
export default questionsSlice.reducer;
