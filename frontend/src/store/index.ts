
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import all reducers
import authReducer from './slices/authSlice';
import testsReducer from './slices/testsSlice';
import questionsReducer from './slices/questionsSlice';
import resultsReducer from './slices/resultsSlice';
import usersReducer from './slices/usersSlice';
import quizReducer from './slices/quizSlice';

// Create and configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    tests: testsReducer,
    questions: questionsReducer,
    results: resultsReducer,
    users: usersReducer,
    quiz: quizReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      // Ignore certain paths for complex objects like dates
      ignoredActions: ['results/saveResult/fulfilled'],
      ignoredPaths: ['results.results.date'],
    },
  }),
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks for use in components
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
