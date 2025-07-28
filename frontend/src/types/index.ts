
export type UserRole = 'guest' | 'student' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type TestMode = 'practice' | 'thematic' | 'exam';

export interface TestSettings {
  timeLimit: number; // in minutes
  questionCount: number;
  passingScore: number;
  attemptsAllowed?: number; // Number of allowed errors
}

export interface Question {
  _id: string;
  text: string;
  imageBase64?: string;
  options: {
    _id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  testId?: string; // Reference to associated test/topic
  isMultipleChoice?: boolean; // New field to indicate multiple choice questions
}

export interface TestResult {
  _id: string;
  userId: string;
  testMode: TestMode;
  date: Date;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  timeSpent: number; // in seconds
  answers: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }[];
}

export interface UserStats {
  totalTests: number;
  averageScore: number;
  correctAnswerPercentage: number;
  testsPassed: number;
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  questionCount: number;
  mode: TestMode;
  imageBase64?: string;
}
