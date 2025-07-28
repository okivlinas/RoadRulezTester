/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-case-declarations */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TestMode, TestSettings, Question } from '@/types';
import { questionsApi } from '@/api';
import { useToast } from '@/components/ui/use-toast';

// Define QuizResults type
interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  timeSpent: number;
}

// Define QuizContextType
interface QuizContextType {
  testMode: TestMode | null;
  testSettings: TestSettings;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, string>;
  timeRemaining: number;
  quizResults: QuizResults | null;
  isQuizActive: boolean;
  selectedTopic: string | null;
  setTestMode: (mode: TestMode | null) => void;
  updateTestSettings: (settings: Partial<TestSettings>) => void;
  startQuiz: (questions?: Question[]) => void;
  selectAnswer: (questionId: string, optionId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  endQuiz: () => void;
  cancelQuiz: () => void;
  setSelectedTopic: (topicId: string | null) => void;
}

// Default test settings
const defaultTestSettings: TestSettings = {
  timeLimit: 30, // 30 minutes
  questionCount: 20,
  passingScore: 70, // 70%
};

// Create QuizContext
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Create QuizProvider component
export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [testMode, setTestMode] = useState<TestMode | null>(null);
  const [testSettings, setTestSettings] = useState<TestSettings>(defaultTestSettings);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(defaultTestSettings.timeLimit * 60);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Update test settings
  const updateTestSettings = useCallback((settings: Partial<TestSettings>) => {
    setTestSettings((prev) => ({ ...prev, ...settings }));
    // Update time remaining if timeLimit changes
    if (settings.timeLimit) {
      setTimeRemaining(settings.timeLimit * 60);
    }
  }, []);
  
  // Load questions from API
  const loadQuestions = useCallback(async (mode: TestMode, count: number, testId?: string) => {
    try {
      let questions: Question[];
      
      switch (mode) {
        case 'practice':
          const response = await questionsApi.getRandomQuestions(count);
          questions = response;
          break;
        case 'thematic':
          if (!testId) {
            throw new Error('Topic ID is required for thematic tests');
          }
          const thematicResponse = await questionsApi.getQuestions({ 
            testId: testId,
            limit: count 
          });
          questions = thematicResponse.data.data.questions;
          break;
        case 'exam':
          const examResponse = await questionsApi.getQuestions({ 
            limit: count 
          });
          questions = examResponse.data.data.questions;
          break;
        default:
          throw new Error('Invalid test mode');
      }
      
      return questions;
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast({
        title: "Ошибка загрузки вопросов",
        description: "Пожалуйста, попробуйте позже",
        variant: "destructive"
      });
      return [];
    }
  }, [toast]);
  
  // Cancel quiz without saving results
  const cancelQuiz = useCallback(() => {
    setQuestions([]);
    setUserAnswers({});
    setQuizResults(null);
    setIsQuizActive(false);
    setTestMode(null);
    
    // Since we removed useNavigate, we'll use window.location to redirect
    window.location.href = '/quiz';
  }, []);
  
  // Start quiz
  const startQuiz = useCallback(async () => {
    if (!testMode) return;
    
    setIsQuizActive(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizStartTime(Date.now());
    setTimeRemaining(testSettings.timeLimit * 60);
    setQuizResults(null);
    
    const questions = await loadQuestions(
      testMode, 
      testSettings.questionCount,
      selectedTopic
    );
    
    if (questions.length === 0) {
      cancelQuiz();
      return;
    }
    
    setQuestions(questions);
  }, [testMode, testSettings, selectedTopic, loadQuestions, cancelQuiz]);
  
  // Select answer
  const selectAnswer = useCallback((questionId: string, optionId: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }, []);
  
  // Navigate to next question
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);
  
  // Navigate to previous question
  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);
  
  // End quiz and calculate results
  const endQuiz = useCallback(() => {
    if (!quizStartTime) return;
    
    const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
    
    // Calculate results
    let correctAnswers = 0;
    questions.forEach((question) => {
      const userAnswer = userAnswers[question._id];
      if (userAnswer) {
        const selectedOption = question.options.find((opt) => opt._id === userAnswer);
        if (selectedOption?.isCorrect) {
          correctAnswers++;
        }
      }
    });
    
    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= testSettings.passingScore;
    
    // Set results
    setQuizResults({
      totalQuestions: questions.length,
      correctAnswers,
      score,
      passed,
      timeSpent,
    });
    
    setIsQuizActive(false);
  }, [questions, userAnswers, quizStartTime, testSettings.passingScore]);
  
  // Timer effect
  useEffect(() => {
    if (isQuizActive && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            endQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isQuizActive, timeRemaining, endQuiz]);
  
  // Create context value
  const contextValue: QuizContextType = {
    testMode,
    testSettings,
    questions,
    currentQuestionIndex,
    userAnswers,
    timeRemaining,
    quizResults,
    isQuizActive,
    selectedTopic,
    setTestMode,
    updateTestSettings,
    startQuiz,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    endQuiz,
    cancelQuiz,
    setSelectedTopic,
  };
  
  return <QuizContext.Provider value={contextValue}>{children}</QuizContext.Provider>;
};

// Create useQuiz hook
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
