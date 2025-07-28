
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, XCircle, AlertCircle, BadgeCheck, BadgeX, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useAppSelector, useAppDispatch } from '@/store';
import { cancelQuiz, setTestMode } from '@/store/slices/quizSlice';
import { saveResult } from '@/store/slices/resultsSlice';
import { SaveResultRequest } from '@/types/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import axios from 'axios';

interface ExamSettingsForm {
  timeLimit: number;
  questionCount: number;
  attemptsAllowed: number;
}

const QuizResults: React.FC = () => {
  const { 
    quizResults, 
    questions, 
    userAnswers, 
    multipleChoiceAnswers, 
    testSettings, 
    testMode,
    isPracticeMode,
    unansweredQuestions
  } = useAppSelector(state => state.quiz);
  const { status } = useAppSelector(state => state.results);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState<ExamSettingsForm>({
    timeLimit: 30,
    questionCount: 20,
    attemptsAllowed: 2,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/setting', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = response.data;
      setSettings({
        timeLimit: +data.timeLimit || 30,
        questionCount: data.questionCount || 30,
        attemptsAllowed: data.attemptsAllowed || 2,
      });
    } catch (error) {
      toast({
        title: 'Error loading settings',
        description: 'Unable to fetch current exam settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testMode === "exam") {
      fetchSettings();
    }
  }, [testMode]);

  if (!quizResults) {
    navigate('/quiz');
    return null;
  }

  // Calculate incorrect answers
  const incorrectAnswers = quizResults.totalQuestions - quizResults.correctAnswers;  
  // Determine if the test was passed based on the mode and settings
  let isPassed = false;
  
  if (isPracticeMode) {
    isPassed = true; // Practice mode with checkbox always passes
  } else {
    // Check based on test mode and allowable errors
    switch (testMode) {
      case 'practice':
        // For practice mode, check against the practice allowable errors setting
        isPassed = incorrectAnswers <= (testSettings.attemptsAllowed || 2);
        break;
      case 'exam':
        // For exam mode, only count actual incorrect answers, not unanswered questions
        isPassed = incorrectAnswers <= (settings.attemptsAllowed || 2);
        break;
      case 'thematic':
      default:
        isPassed = incorrectAnswers <= (testSettings.attemptsAllowed || 2);
        break;
    }
  }
  
  const handleReturnToMenu = () => {
    dispatch(setTestMode(null));
    window.location.href = '/'; // Полная перезагрузка страницы
  };
  
  const handleSaveResults = () => {
    const resultData: SaveResultRequest = {
      testMode: testMode || 'practice',
      totalQuestions: quizResults.totalQuestions,
      correctAnswers: quizResults.correctAnswers,
      score: quizResults.score,
      passed: isPassed,
      timeSpent: quizResults.timeSpent,
      date: new Date(),
      answers: quizResults.answers.map(answer => ({
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        isCorrect: answer.isCorrect,
      })),
    };
    
    dispatch(saveResult(resultData))
      .unwrap()
      .then(() => {
        toast({
          title: 'Результаты сохранены',
          description: 'Ваши результаты теста были успешно сохранены в системе.',
        });
        window.location.href = '/'; // Полная перезагрузка страницы
      })
      .catch((error) => {
        window.location.href = '/'; // Полная перезагрузка страницы
      });
  };

  const handleTestsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(cancelQuiz());
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}м ${remainingSeconds}с`;
  };

  if (questions.length === 0) {
    toast({
      title: "Ошибка данных",
      description: "Данные результатов недоступны",
      variant: "destructive"
    });
    return null;
  }

  const getattemptsAllowedText = () => {
    if (isPracticeMode) {
      return 'Без учета ошибок';
    } else if (testMode === 'practice') {
      return `${testSettings.attemptsAllowed || 1}`;
    } else if (testMode === 'exam') {
      return `${settings.attemptsAllowed || 2}`;
    } else { 
      return `${testSettings.attemptsAllowed || 1}`;
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={handleTestsClick}>Тесты</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Результаты</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <Card className="max-w-3xl mx-auto mb-6">
        <CardHeader className="text-center border-b pb-6">
          <div className="mx-auto mb-2">
            {isPassed ? (
              <BadgeCheck className="h-16 w-16 text-green-500" />
            ) : (
              <BadgeX className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isPassed ? 'Тест пройден!' : 'Тест не пройден'}
          </CardTitle>
          {isPracticeMode ? (
            <p className="text-muted-foreground">
              Режим без ошибок - все тесты считаются пройденными
            </p>
          ) : (
            <p className="text-muted-foreground">
              {isPassed 
                ? 'Вы успешно прошли тест!' 
                : `Превышено допустимое количество ошибок (${incorrectAnswers} из ${getattemptsAllowedText()} допустимых)`}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Результат</p>
            <p className="text-2xl font-bold">{quizResults.score.toFixed(0)}%</p>
            <Progress 
              value={quizResults.score} 
              className="h-2 mt-2"
            />
          </div>
          <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Правильные ответы</p>
              <p className="text-2xl font-bold">{quizResults.correctAnswers} / {quizResults.totalQuestions}</p>
              <Progress 
                value={(quizResults.correctAnswers / quizResults.totalQuestions) * 100} 
                className="h-2 mt-2"
              />
            </div>
        </div>
        
        <div className="bg-muted rounded-lg p-4 mb-6">
            {testMode === 'exam' && (
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Затраченное время</p>
                  <p className="text-sm font-medium">{formatTime(quizResults.timeSpent)}</p>
                </div>
            )}
          <div className="flex justify-between mt-2">
            <p className="text-sm text-muted-foreground">Допустимое кол-во ошибок</p>
            <p className="text-sm font-medium">{getattemptsAllowedText()}</p>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-sm text-muted-foreground">Допущено ошибок</p>
            <p className={`text-sm font-medium ${!isPassed && !isPracticeMode ? 'text-red-500 font-bold' : ''}`}>
              {incorrectAnswers}
            </p>
          </div>
          {unansweredQuestions.length > 0 && (
            <div className="flex justify-between mt-2">
              <p className="text-sm text-muted-foreground">Неотвеченных вопросов</p>
              <p className="text-sm font-medium">{unansweredQuestions.length}</p>
            </div>
          )}
        </div>

          <h3 className="font-semibold text-lg mb-4">Обзор вопросов</h3>
          
          <div className="space-y-4">
            {questions.map((question, index) => {
              let isCorrect = false;
              
              if (question.isMultipleChoice) {
                // For multiple choice questions
                const selectedAnswerIds = multipleChoiceAnswers[question._id] || [];
                const correctAnswerIds = question.options
                  .filter(opt => opt.isCorrect)
                  .map(opt => opt._id);
                
                // Check if all correct answers were selected and no incorrect ones
                const allCorrectSelected = correctAnswerIds.every(id => 
                  selectedAnswerIds.includes(id));
                const noIncorrectSelected = selectedAnswerIds.every(id => 
                  correctAnswerIds.includes(id));
                isCorrect = allCorrectSelected && noIncorrectSelected;
              } else {
                // For single choice questions
                const selectedOptionId = userAnswers[question._id] || '';
                const selectedOption = question.options.find(option => option._id === selectedOptionId);
                isCorrect = selectedOption?.isCorrect || false;
              }
              
              return (
                <div key={question._id} className="border rounded-lg overflow-hidden">
                  <div className="bg-muted p-3 flex justify-between items-center">
                    <span className="font-medium">Вопрос {index + 1}</span>
                    {isCorrect ? (
                      <span className="text-green-500 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Верно
                      </span>
                    ) : unansweredQuestions.includes(index) ? (
                      <span className="text-amber-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Нет ответа
                      </span>
                    ) : unansweredQuestions.includes(index) ? (
                      <span className="text-amber-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Нет ответа
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center">
                        <XCircle className="h-4 w-4 mr-1" />
                        Неверно
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium mb-2">{question.text}</p>
                    {question.imageBase64 && (
                      <div className="mb-3">
                        <img 
                          src={question.imageBase64.startsWith('data:') 
                            ? question.imageBase64 
                            : `data:image/jpeg;base64,${question.imageBase64}`}
                          alt="Изображение вопроса"
                          className="max-h-48 object-contain mx-auto rounded-md"
                        />
                      </div>
                    )}
                    <div className="mb-3">
                      {question.options.map((option, i) => {
                        let className = "";
                        
                        if (question.isMultipleChoice) {
                          // For multiple choice questions
                          const selectedAnswerIds = multipleChoiceAnswers[question._id] || [];
                          const isSelected = selectedAnswerIds.includes(option._id);
                          
                          if (isSelected && option.isCorrect) {
                            className = "bg-green-50 border border-green-200";
                          } else if (isSelected && !option.isCorrect) {
                            className = "bg-red-50 border border-red-200";
                          } else if (!isSelected && option.isCorrect) {
                            className = "bg-green-50 border border-green-200";
                          }
                        } else {
                          // For single choice questions
                          const selectedOptionId = userAnswers[question._id] || '';
                          const isSelected = option._id === selectedOptionId;
                          
                          if (isSelected && option.isCorrect) {
                            className = "bg-green-50 border border-green-200";
                          } else if (isSelected && !option.isCorrect) {
                            className = "bg-red-50 border border-red-200";
                          } else if (!isSelected && option.isCorrect) {
                            className = "bg-green-50 border border-green-200";
                          }
                        }
                        
                        return (
                          <div 
                            key={option._id}
                            className={`p-2 rounded-md mb-2 ${className}`}
                          >
                            <div className="flex items-start">
                              <div className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                                option.isCorrect 
                                  ? 'bg-green-100 text-green-800' 
                                  : (question.isMultipleChoice 
                                      ? (multipleChoiceAnswers[question._id] || []).includes(option._id)
                                      : option._id === userAnswers[question._id])
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-gray-100'
                              }`}>
                                {i + 1}
                              </div>
                              <div className="flex-grow">
                                {option.text}
                                {option.isCorrect && (
                                  <span className="ml-2 text-green-600 text-sm">
                                    (Правильный ответ)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {question.explanation && (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-amber-800">Объяснение:</p>
                            <p className="text-amber-700">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={handleReturnToMenu}>
            Вернуться в меню
          </Button>
          <Button 
            onClick={handleSaveResults} 
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Сохранение...' : 'Сохранить результаты'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizResults;
