/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Question, TestMode, TestSettings } from '@/types';
import { questionsApi } from '@/api';

const defaultTestSettings: TestSettings = {
  timeLimit: 30, // 30 minutes
  questionCount: 20,
  passingScore: 70, // 70%
  attemptsAllowed: 2, // Default allowable errors
};

// Helper function to shuffle array - used for randomizing questions
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Create async thunks for fetching questions
export const fetchRandomQuestions = createAsyncThunk(
  'quiz/fetchRandomQuestions',
  async (count: number) => {
    const response = await questionsApi.getRandomQuestions(count);
    // Shuffle questions before returning
    return shuffleArray(response);
  }
);

export const fetchQuestionsForTopic = createAsyncThunk(
  'quiz/fetchQuestionsForTopic',
  async ({ testId, count }: { testId: string, count: number }) => {
    const response = await questionsApi.getQuestions({ 
      testId: testId,
      limit: count 
    });
    // Shuffle questions before returning
    return shuffleArray(response.data.data.questions);
  }
);

export const fetchQuestionsForExam = createAsyncThunk(
  'quiz/fetchQuestionsForExam',
  async (count: number) => {
    const response = await questionsApi.getQuestions({ 
      limit: count 
    });
    // Shuffle questions before returning
    return shuffleArray(response.data.data.questions);
  }
);

interface QuizState {
  testMode: TestMode | null;
  testSettings: TestSettings;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, string>;
  multipleChoiceAnswers: Record<string, string[]>; // Field for multiple choice
  timeRemaining: number;
  quizResults: {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    passed: boolean;
    timeSpent: number;
    answers: {
      questionId: string;
      selectedOptionId: string;
      isCorrect: boolean;
    }[];
  } | null;
  isQuizActive: boolean;
  selectedTopic: string | null;
  incorrectAnswers: number;
  isPracticeMode: boolean; // New field to indicate practice mode
  unansweredQuestions: number[]; // New field to track unanswered questions
}

const initialState: QuizState = {
  testMode: null,
  testSettings: defaultTestSettings,
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: {},
  multipleChoiceAnswers: {}, // Initialize empty record
  timeRemaining: defaultTestSettings.timeLimit * 60,
  quizResults: null,
  isQuizActive: false,
  selectedTopic: null,
  incorrectAnswers: 0,
  isPracticeMode: false, // Default to false
  unansweredQuestions: [],
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setTestMode: (state, action: PayloadAction<TestMode | null>) => {
      state.testMode = action.payload;
    },
    
    updateTestSettings: (state, action: PayloadAction<Partial<any>>) => {
      console.log(state.timeRemaining )
      state.testSettings = { ...state.testSettings, ...action.payload };
 
      if (action.payload.timeLimit) {
        state.timeRemaining = +action.payload.timeLimit * 60;

      }
    },
    
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
    },
    
    startQuiz: (state, action: PayloadAction<Question[] | undefined>) => {
      if (action.payload) {
        // Always shuffle questions when starting a quiz
        state.questions = shuffleArray(action.payload);
      } else {
        // If no questions provided, shuffle existing questions
        state.questions = shuffleArray([...state.questions]);
      }
      state.isQuizActive = true;
      state.currentQuestionIndex = 0;
      state.userAnswers = {};
      state.multipleChoiceAnswers = {};
      state.timeRemaining = state.testSettings.timeLimit * 60;
      state.quizResults = null;
      state.incorrectAnswers = 0;
      state.unansweredQuestions = [];
    },
    
    selectAnswer: (state, action: PayloadAction<{ questionId: string; optionId: string }>) => {
      const { questionId, optionId } = action.payload;
      state.userAnswers[questionId] = optionId;
      
      // Remove from unanswered questions if it was there
      state.unansweredQuestions = state.unansweredQuestions.filter(
        index => state.questions[index]._id !== questionId
      );
    },
    
    selectMultipleAnswers: (state, action: PayloadAction<{ questionId: string; optionIds: string[] }>) => {
      const { questionId, optionIds } = action.payload;
      state.multipleChoiceAnswers[questionId] = optionIds;
      
      // Remove from unanswered questions if it was there
      state.unansweredQuestions = state.unansweredQuestions.filter(
        index => state.questions[index]._id !== questionId
      );
    },
    
    checkCurrentAnswer: (state) => {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      if (!currentQuestion) return;
      
      if (currentQuestion.isMultipleChoice) {
        // For multiple choice questions
        const selectedAnswerIds = state.multipleChoiceAnswers[currentQuestion._id] || [];
        const correctAnswerIds = currentQuestion.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt._id);
        
        // Check if all correct options are selected and no incorrect ones
        const allCorrectSelected = correctAnswerIds.every(id => 
          selectedAnswerIds.includes(id));
        const noIncorrectSelected = selectedAnswerIds.every(id => 
          correctAnswerIds.includes(id));
        
        // Answer is only correct if ALL correct options are selected AND NO incorrect ones
        if (!(allCorrectSelected && noIncorrectSelected)) {
          state.incorrectAnswers += 1;
        }
      } else {
        // For single choice questions
        const selectedOptionId = state.userAnswers[currentQuestion._id];
        if (selectedOptionId) {
          const selectedOption = currentQuestion.options.find(
            (option) => option._id === selectedOptionId
          );
          if (selectedOption && !selectedOption.isCorrect) {
            state.incorrectAnswers += 1;
          }
        }
      }
    },
    
    // Modified endQuiz action to complete the test even with unanswered questions
    endQuiz: (state) => {
      if (!state.isQuizActive) return;
      
      let correctAnswers = 0;
      const answers: { questionId: string; selectedOptionId: string; isCorrect: boolean }[] = [];
      const unansweredQuestions: number[] = [];
      
      state.questions.forEach((question, index) => {
        if (question.isMultipleChoice) {
          // For multiple choice questions
          const selectedAnswerIds = state.multipleChoiceAnswers[question._id] || [];
          
          // Check if question is unanswered
          if (selectedAnswerIds.length === 0) {
            unansweredQuestions.push(index);
          }
          
          const correctAnswerIds = question.options
            .filter(opt => opt.isCorrect)
            .map(opt => opt._id);
          
          // Answer is only correct if ALL correct options are selected AND NO incorrect ones
          const allCorrectSelected = correctAnswerIds.every(id => 
            selectedAnswerIds.includes(id));
          const noIncorrectSelected = selectedAnswerIds.every(id => 
            correctAnswerIds.includes(id));
          
          const isCorrect = allCorrectSelected && noIncorrectSelected;
          
          if (isCorrect) {
            correctAnswers++;
          }
          
          // Add to answers array (using first selected option or empty string if none)
          answers.push({
            questionId: question._id,
            selectedOptionId: selectedAnswerIds[0] || '',
            isCorrect: isCorrect
          });
        } else {
          // For single choice questions
          const userAnswer = state.userAnswers[question._id];
          
          // Check if question is unanswered
          if (!userAnswer) {
            unansweredQuestions.push(index);
          }
          
          let isCorrect = false;
          
          if (userAnswer) {
            const selectedOption = question.options.find(
              (option) => option._id === userAnswer
            );
            isCorrect = selectedOption?.isCorrect || false;
            
            if (isCorrect) {
              correctAnswers++;
            }
          }
          
          answers.push({
            questionId: question._id,
            selectedOptionId: userAnswer || '',
            isCorrect
          });
        }
      });
      
      // Update unanswered questions list
      state.unansweredQuestions = unansweredQuestions;
      
      const score = (correctAnswers / state.questions.length) * 100;
      
      // Determine if passed based on test mode, practice mode, and settings
      let passed = false;
      
      if (state.isPracticeMode) {
        passed = true; // Practice mode checkbox always passes
      } else {
        // For all test modes
        if (state.testMode === "exam") {
          // For exam mode, only consider actual incorrect answers, not unanswered ones
          const answeredQuestions = state.questions.length - unansweredQuestions.length;
          const incorrectAnswers = answeredQuestions - correctAnswers;
          const attemptsAllowed = state.testSettings.attemptsAllowed || 2;
          passed = incorrectAnswers <= attemptsAllowed;
        } else {
          // For other test modes
          const incorrectCount = state.questions.length - correctAnswers;
          const attemptsAllowed = state.testSettings.attemptsAllowed || 2;
          passed = incorrectCount <= attemptsAllowed;
        }
      }
      
      const timeSpent = state.testSettings.timeLimit * 60 - state.timeRemaining;
      
      state.quizResults = {
        totalQuestions: state.questions.length,
        correctAnswers,
        score,
        passed,
        timeSpent,
        answers
      };
      
      state.isQuizActive = false;
    },
    
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    
    decrementTime: (state) => {
      if (state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      } else {
        state.timeRemaining = 0;
      }
    },
    
    cancelQuiz: (state) => {
      state.isQuizActive = false;
      state.questions = [];
      state.userAnswers = {};
      state.multipleChoiceAnswers = {};
      state.quizResults = null;
      state.currentQuestionIndex = 0;
      state.testMode = null;
      state.incorrectAnswers = 0;
      state.isPracticeMode = false;
      state.unansweredQuestions = [];
    },
    
    incrementIncorrect: (state) => {
      state.incorrectAnswers += 1;
    },
    
    setSelectedTopic: (state, action: PayloadAction<string | null>) => {
      state.selectedTopic = action.payload;
    },
    
    setIsPracticeMode: (state, action: PayloadAction<boolean>) => {
      state.isPracticeMode = action.payload;
    },
    
    clearUnansweredQuestions: (state) => {
      state.unansweredQuestions = [];
    },
    
    goToQuestion: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.questions.length) {
        state.currentQuestionIndex = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRandomQuestions.fulfilled, (state, action) => {
        state.questions = action.payload;
      })
      .addCase(fetchQuestionsForTopic.fulfilled, (state, action) => {
        state.questions = action.payload;
      })
      .addCase(fetchQuestionsForExam.fulfilled, (state, action) => {
        state.questions = action.payload;
      });
  }
});

export const {
  setTestMode,
  updateTestSettings,
  setQuestions,
  startQuiz,
  selectAnswer,
  selectMultipleAnswers,  
  nextQuestion,
  previousQuestion,
  endQuiz,
  decrementTime,
  cancelQuiz,
  checkCurrentAnswer,
  incrementIncorrect,
  setSelectedTopic,
  setIsPracticeMode,
  clearUnansweredQuestions,
  goToQuestion,
} = quizSlice.actions;

export default quizSlice.reducer;
