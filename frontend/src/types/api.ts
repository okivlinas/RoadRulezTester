
import { User, Question, TestResult, TestMode, Test } from './index';

// Общий интерфейс для ответов API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Ответ на запрос аутентификации
export interface AuthResponse {
  user: User;
  token: string;
}

// Запрос на логин
export interface LoginRequest {
  email: string;
  password: string;
}

// Запрос на регистрацию
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Ответ на запрос для получения тестов
export interface TestsResponse {
  tests: Test[];
  totalCount: number;
}

// Параметры запроса для получения тестов
export interface GetTestsParams {
  search?: string;
  page?: number;
  limit?: number;
  mode?: TestMode;
}

// Запрос на создание/обновление теста
export interface TestRequest {
  _id?: string;
  title: string;
  description: string;
  questionCount: number;
  mode: TestMode;
  imageBase64?: string;
}

// Параметры запроса для получения вопросов
export interface GetQuestionsParams {
  testId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Запрос на создание/обновление вопроса
export interface QuestionRequest {
  _id?: string;
  text: string;
  imageBase64?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  testId?: string;
  isMultipleChoice?: boolean; // Add this field
}

// Запрос на сохранение результата теста
export interface SaveResultRequest {
  testMode: TestMode;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  timeSpent: number;
  date: Date;
  answers: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }[];
}

// Параметры запроса для получения статистики пользователя
export interface GetStatsParams {
  mode?: TestMode | 'all';
  startDate?: string;
  endDate?: string;
}

// Запрос на обновление профиля пользователя
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
}

// Параметры для получения пользователей (только для админа)
export interface GetUsersParams {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

// Интерфейс для загрузки файлов
export interface FileUploadResponse {
  url: string;
  path?: string;
  fileName?: string;
}
