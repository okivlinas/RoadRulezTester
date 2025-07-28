
/* eslint-disable no-useless-catch */

import React, { createContext, useContext, useEffect } from 'react';
import { User } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  login as loginAction, 
  register as registerAction, 
  logout as logoutAction,
  updateProfile as updateProfileAction,
  fetchCurrentUser
} from '@/store/slices/authSlice';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);
  
  const login = async (email: string, password: string) => {
    try {
      const resultAction = await dispatch(loginAction({ email, password }));
      if (loginAction.rejected.match(resultAction)) {
        throw new Error(resultAction.payload as string);
      }
    } catch (error) {
      throw error;
    }
  };
  
  const register = async (name: string, email: string, password: string) => {
    try {
      const resultAction = await dispatch(registerAction({ name, email, password }));
      if (registerAction.rejected.match(resultAction)) {
        throw new Error(resultAction.payload as string);
      }
    } catch (error) {
      throw error;
    }
  };
  
  const logout = () => {
    dispatch(logoutAction());
  };
  
  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user) throw new Error('Не авторизован');
    
    try {
      const resultAction = await dispatch(updateProfileAction(userData));
      if (updateProfileAction.rejected.match(resultAction)) {
        throw new Error(resultAction.payload as string);
      }
    } catch (error) {
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};
