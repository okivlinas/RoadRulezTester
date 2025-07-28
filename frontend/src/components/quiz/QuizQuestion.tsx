
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Timer, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useAppSelector, useAppDispatch } from '@/store';
import { selectAnswer, nextQuestion, previousQuestion, endQuiz, cancelQuiz, decrementTime, checkCurrentAnswer, incrementIncorrect, selectMultipleAnswers } from '@/store/slices/quizSlice';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const QuizQuestion: React.FC = () => {
  const { 
    questions, 
    currentQuestionIndex, 
    userAnswers, 
    multipleChoiceAnswers,
    timeRemaining,
    testMode,
    incorrectAnswers,
    testSettings
  } = useAppSelector(state => state.quiz);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showExplanation, setShowExplanation] = useState(false);
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showUnansweredWarning, setShowUnansweredWarning] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  // Critical check: is this a multiple choice question?
  const isMultipleChoice = currentQuestion?.isMultipleChoice || false;
  
  // Reset selected options when moving to a new question
  useEffect(() => {
    if (currentQuestion) {
      if (isMultipleChoice) {
        // For multiple choice, initialize from existing answers or empty array
        setSelectedOptions(multipleChoiceAnswers[currentQuestion._id] || []);
      } else {
        // For single choice, reset or set from existing answer
        setPendingOptionId(userAnswers[currentQuestion._id] || null);
      }
    }
  }, [currentQuestion, currentQuestionIndex, userAnswers, multipleChoiceAnswers, isMultipleChoice]);
  
  // Timer effect - only for exam mode
  useEffect(() => {
    if (testMode === 'exam' && timeRemaining > 0) {
      const timer = setInterval(() => {
        if (timeRemaining <= 1) {
          dispatch(endQuiz());
          clearInterval(timer);
        } else {
          dispatch(decrementTime());
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [timeRemaining, dispatch, testMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (testMode === 'practice' && e.key === 'F2') {
        setShowExplanation(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [testMode]);
  
  const selectedOptionId = userAnswers[currentQuestion?._id] || '';
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    if (questions.length === 0) {
      toast({
        title: "Ошибка загрузки вопросов",
        description: "Не удалось загрузить вопросы для теста",
        variant: "destructive"
      });
    }
  }, [questions, toast]);
  
  useEffect(() => {
    if (questions.length > 0 && !currentQuestion) {
      toast({
        title: "Ошибка данных",
        description: "Вопрос не найден",
        variant: "destructive"
      });
    }
  }, [questions, currentQuestion, toast]);

  // Format remaining time as MM:SS
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const handleSelectSingleOption = (optionId: string) => {
    setPendingOptionId(optionId);
  };
  
  const handleSelectMultipleOption = (optionId: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };
  
  const handleConfirm = () => {
    if (isMultipleChoice) {
      // For multiple choice questions
      if (selectedOptions.length === 0) {
        toast({
          title: "Выберите ответ",
          description: "Пожалуйста, выберите хотя бы один вариант ответа",
          variant: "destructive"
        });
        return;
      }
      
      dispatch(selectMultipleAnswers({ 
        questionId: currentQuestion._id, 
        optionIds: selectedOptions 
      }));
      
      // Check if the answer is correct (all correct options selected and no incorrect ones)
      const correctOptions = currentQuestion.options.filter(opt => opt.isCorrect).map(opt => opt._id);
      const allCorrectSelected = correctOptions.every(id => selectedOptions.includes(id));
      const noIncorrectSelected = selectedOptions.every(id => correctOptions.includes(id));
      const isCorrect = allCorrectSelected && noIncorrectSelected;
      
      // For practice mode, call checkCurrentAnswer to track incorrectly answered questions
      if (testMode === "practice") {
        dispatch(checkCurrentAnswer());
      }
      
      if (testMode === "exam" && !isCorrect) {
        dispatch(incrementIncorrect());
        if (incorrectAnswers + 1 >= testSettings.attemptsAllowed) {
          handleFinish();
        }
      }
    } else {
      // For single choice questions
      if (!pendingOptionId) return;
      
      dispatch(selectAnswer({ 
        questionId: currentQuestion._id, 
        optionId: pendingOptionId 
      }));
      
      // For practice mode, call checkCurrentAnswer to track incorrectly answered questions
      if (testMode === "practice") {
        dispatch(checkCurrentAnswer());
      }
      
      const isCorrect = currentQuestion.options.find(
        opt => opt._id === pendingOptionId
      )?.isCorrect ?? false;
      
      if (testMode === "exam" && !isCorrect) {
        dispatch(incrementIncorrect());
        if (incorrectAnswers + 1 >= testSettings.attemptsAllowed) {
          handleFinish(); 
        } 
      }
    }
  };  

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleConfirm();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [pendingOptionId, selectedOptions, incorrectAnswers]);
  
  // Check for unanswered questions
  const getUnansweredQuestions = () => {
    return questions.map((question, index) => {
      if (question.isMultipleChoice) {
        return multipleChoiceAnswers[question._id] ? null : index + 1;
      } else {
        return userAnswers[question._id] ? null : index + 1;
      }
    }).filter(num => num !== null);
  };
  
  const handleFinishClick = () => {
    const unanswered = getUnansweredQuestions();
    if (unanswered.length > 0) {
      setShowUnansweredWarning(true);
    } else {
      handleFinish();
    }
  };
  
  const handleFinish = () => {
    dispatch(endQuiz());
  };
  
  const handleCancelQuiz = () => {
    dispatch(cancelQuiz());
    navigate('/quiz');
  };
  
  const hasAnswered = isMultipleChoice 
    ? multipleChoiceAnswers[currentQuestion?._id] !== undefined
    : userAnswers[currentQuestion?._id] !== undefined;
  
  // For answers display in multiple choice questions
  const getMultipleChoiceAnswerStatus = () => {
    // Get selected answers
    const selectedAnswerIds = multipleChoiceAnswers[currentQuestion._id] || [];
    
    // Get all correct answers
    const correctAnswerIds = currentQuestion.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt._id);
    
    // Check if all correct answers were selected and no incorrect ones
    const allCorrectSelected = correctAnswerIds.every(id => selectedAnswerIds.includes(id));
    const noIncorrectSelected = selectedAnswerIds.every(id => 
      correctAnswerIds.includes(id));
    
    // Answer is only correct if ALL correct options are selected AND NO incorrect ones
    return allCorrectSelected && noIncorrectSelected;
  };
  
  if (!currentQuestion) {
    return <div className="p-8 text-center">Загрузка вопроса...</div>;
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/quiz">Тесты</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Текущий тест</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
     <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium">
          Вопрос {currentQuestionIndex + 1} из {questions.length}
          {isMultipleChoice && (
            <span className="ml-2 text-primary">(Множественный выбор)</span>
          )}
        </div>
          {testMode === 'exam' && (
            <div className="flex items-center text-sm font-medium">
              <Timer className="h-4 w-4 mr-1 text-primary" />
              Осталось времени: {formattedTime}
            </div>
          )}
      </div>
      
      <Card className="mb-6">
        <CardHeader className="border-b">
          <div className="text-xl font-semibold">{currentQuestion.text}</div>
          {currentQuestion.imageBase64 && (
            <Dialog>
              <DialogTrigger asChild>
                <img
                  src={currentQuestion.imageBase64.startsWith("data:")
                    ? currentQuestion.imageBase64
                    : `data:image/jpeg;base64,${currentQuestion.imageBase64}`}
                  alt="Изображение вопроса"
                  className="max-h-64 object-contain mx-auto rounded-md cursor-zoom-in"
                />
              </DialogTrigger>
              <DialogContent className="p-0 max-w-4xl">
                <img
                  src={currentQuestion.imageBase64.startsWith("data:")
                    ? currentQuestion.imageBase64
                    : `data:image/jpeg;base64,${currentQuestion.imageBase64}`}
                  alt="Изображение вопроса"
                  className="w-full h-auto object-contain"
                />
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-3">
            {!hasAnswered ? (
              <>
                <div className="space-y-3 mt-4">
                  {isMultipleChoice ? (
                    // Multiple choice question UI with checkboxes
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, i) => (
                        <div
                          key={option._id}
                          className={cn(
                            "quiz-option p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                            selectedOptions.includes(option._id) && "border-primary bg-primary/10"
                          )}
                          onClick={() => handleSelectMultipleOption(option._id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full border border-primary flex items-center justify-center mr-3 flex-shrink-0">
                                {i + 1}
                              </div>
                              <div>{option.text}</div>
                            </div>
                            <Checkbox 
                              checked={selectedOptions.includes(option._id)}
                              onCheckedChange={() => handleSelectMultipleOption(option._id)}
                              className="h-5 w-5"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Single choice question UI with radio buttons
                    <RadioGroup value={pendingOptionId || undefined} onValueChange={handleSelectSingleOption}>
                      {currentQuestion.options.map((option, i) => (
                        <div
                          key={option._id}
                          className={cn(
                            "quiz-option p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                            pendingOptionId === option._id && "border-primary bg-primary/10"
                          )}
                          onClick={() => handleSelectSingleOption(option._id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full border border-primary flex items-center justify-center mr-3 flex-shrink-0">
                                {i + 1}
                              </div>
                              <div>{option.text}</div>
                            </div>
                            <RadioGroupItem value={option._id} id={option._id} />
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  <button
                    onClick={handleConfirm}
                    disabled={isMultipleChoice ? selectedOptions.length === 0 : !pendingOptionId}
                    className={cn(
                      "mt-4 px-4 py-2 rounded transition-colors",
                      (isMultipleChoice ? selectedOptions.length > 0 : pendingOptionId)
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    )}
                  >
                    Подтвердить ответ
                  </button>
                </div>
              </>
            ) : (
              // Показываем результат после выбора
              (() => {
                const isCorrect = isMultipleChoice 
                  ? getMultipleChoiceAnswerStatus()
                  : currentQuestion.options.find(opt => opt._id === selectedOptionId)?.isCorrect ?? false;
                
                return (
                  <div key={currentQuestion._id} className="border rounded-lg overflow-hidden">
                    <div className="bg-muted p-3 flex justify-between items-center">
                      {isCorrect ? (
                        <span className="text-green-500 flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Верно
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <XCircle className="h-4 w-4 mr-1" />
                          Неверно
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="mb-3">
                        {currentQuestion.options.map((option, i) => {
                          const isSelected = isMultipleChoice
                            ? (multipleChoiceAnswers[currentQuestion._id] || []).includes(option._id)
                            : option._id === selectedOptionId;
                            
                          let className = "";
                          if (isSelected && option.isCorrect) {
                            className = "bg-green-50 border border-green-200";
                          } else if (isSelected && !option.isCorrect) {
                            className = "bg-red-50 border border-red-200";
                          } else if (!isSelected && option.isCorrect) {
                            className = "bg-green-50 border border-green-200";
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
                                    : isSelected
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
                      
                      {testMode !== "exam" && currentQuestion.explanation && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mt-4">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-medium text-amber-800">Объяснение:</p>
                              <p className="text-amber-700">{currentQuestion.explanation}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          <Button
            variant="outline"
            onClick={() => {
              setPendingOptionId(null);
              setSelectedOptions([]);
              dispatch(previousQuestion());
            }}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Предыдущий
          </Button>
          {isLastQuestion ? (
            <Button onClick={handleFinishClick}>
              Завершить тест
            </Button>
          ) : (
            <Button
              onClick={() => {
                setShowExplanation(false);
                setPendingOptionId(null);
                setSelectedOptions([]);
                dispatch(nextQuestion());
              }}  
            >
              Следующий
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              Закончить тест досрочно
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Закончите тест и узнайте результаты прямо сейчас, или выйти без учета результатов.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={handleFinish}>Закончить и получить результаты</AlertDialogAction>
              <AlertDialogAction onClick={handleCancelQuiz} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Выйти
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Dialog for unanswered questions warning - allow test completion */}
      <AlertDialog open={showUnansweredWarning} onOpenChange={setShowUnansweredWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Имеются неотвеченные вопросы</AlertDialogTitle>
            <AlertDialogDescription>
              В тесте есть вопросы, на которые вы не ответили:
              <ul className="list-disc pl-5 mt-2">
                {getUnansweredQuestions().map(num => (
                  <li key={num}>Вопрос {num}</li>
                ))}
              </ul>
              Хотите завершить тест, не отвечая на эти вопросы?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Вернуться к тесту</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinish}>
              Завершить тест
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizQuestion;
