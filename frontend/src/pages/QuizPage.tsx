
/* eslint-disable react-hooks/rules-of-hooks */

import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import TestModeSelector from '@/components/quiz/TestModeSelector';
import TestSettings from '@/components/quiz/TestSettings';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import QuizResults from '@/components/quiz/QuizResults';
import { checkServerHealth } from '@/api/config';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useAppSelector, useAppDispatch } from '@/store';
import { endQuiz, setTestMode, cancelQuiz } from '@/store/slices/quizSlice';
import { Provider } from 'react-redux';
import { store } from '@/store';

const QuizPageContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { 
    testMode, 
    isQuizActive, 
    quizResults, 
    timeRemaining
  } = useAppSelector(state => state.quiz);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Check server health on component mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const isHealthy = await checkServerHealth();
        setServerStatus(isHealthy ? 'online' : 'offline');
        
        if (!isHealthy) {
          toast({
            title: "Проблема с подключением",
            description: "Не удается подключиться к серверу. API запросы могут не работать.",
            variant: "destructive"
          });
        }
      } catch (error) {
        setServerStatus('offline');
        toast({
          title: "Ошибка подключения",
          description: "Не удается проверить состояние сервера",
          variant: "destructive"
        });
      }
    };
    
    checkServer();
  }, [toast]);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  // Set up timer for quiz if active
  useEffect(() => {
    if (isQuizActive && timeRemaining > 0) {
      const timer = setInterval(() => {
        if (timeRemaining <= 1) {
          dispatch(endQuiz());
          clearInterval(timer);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isQuizActive, timeRemaining, dispatch]);
  
  const handleRetryServerConnection = async () => {
    setServerStatus('checking');
    try {
      const isHealthy = await checkServerHealth();
      setServerStatus(isHealthy ? 'online' : 'offline');
      
      if (isHealthy) {
        toast({
          title: "Соединение восстановлено",
          description: "Подключение к серверу успешно установлено",
        });
      } else {
        toast({
          title: "Проблема с подключением",
          description: "Не удается подключиться к серверу. API запросы могут не работать.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setServerStatus('offline');
      toast({
        title: "Ошибка подключения",
        description: "Не удается проверить состояние сервера",
        variant: "destructive"
      });
    }
  };

  // Handle breadcrumb navigation to tests
  const handleTestsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (testMode !== null && !isQuizActive && !quizResults) {
      dispatch(setTestMode(null));
    }
    if (quizResults) {
      dispatch(cancelQuiz());
    }
  };
  
  const renderContent = () => {
    if (serverStatus === 'offline') {
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Сервер недоступен</AlertTitle>
            <AlertDescription>
              Не удается подключиться к серверу API. Пожалуйста, убедитесь что:
              <ul className="list-disc pl-5 mt-2">
                <li>Ваш бэкенд-сервер работает на http://localhost:3001</li>
                <li>У вас есть подключение к интернету</li>
                <li>API сервер не заблокирован брандмауэром</li>
              </ul>
              <Button 
                onClick={handleRetryServerConnection} 
                className="mt-4"
                variant="outline"
              >
                Повторить подключение
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    if (quizResults) {
      return <QuizResults />;
    }
    
    if (isQuizActive) {
      return <QuizQuestion />;
    }
    
    if (testMode) {
      return <TestSettings />;
    }
    
    return <TestModeSelector />;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {!isQuizActive && !quizResults && (
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Главная</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" onClick={handleTestsClick}>Тесты</BreadcrumbLink>
                </BreadcrumbItem>
                {testMode && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {testMode === 'practice' ? 'Практика' : 
                         testMode === 'thematic' ? 'Тематический тест' : 
                         'Экзамен'}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

// Wrap the component with Redux Provider
const QuizPage: React.FC = () => {
  return (
    <Provider store={store}>
      <QuizPageContent />
    </Provider>
  );
};

export default QuizPage;
