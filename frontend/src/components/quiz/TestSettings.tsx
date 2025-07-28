
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Clock, HelpCircle, List, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { testsApi, questionsApi } from '@/api';
import { TestMode } from '@/types';
import { useAppSelector, useAppDispatch } from '@/store';
import { 
  updateTestSettings, 
  setSelectedTopic, 
  startQuiz,
  fetchRandomQuestions,
  fetchQuestionsForTopic,
  fetchQuestionsForExam,
  setIsPracticeMode
} from '@/store/slices/quizSlice';
import { fetchTests } from '@/store/slices/testsSlice';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';

interface ExamSettingsForm {
  timeLimit: number;
  questionCount: number;
  attemptsAllowed: number;
}

const TestSettings: React.FC = () => {
  const { testMode, testSettings, selectedTopic, isPracticeMode } = useAppSelector(state => state.quiz);
  
  const { tests } = useAppSelector(state => state.tests);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTopics, setIsFetchingTopics] = useState(false);
  const [availableQuestionsCount, setAvailableQuestionsCount] = useState(0);
  const [selectedTopicMax, setSelectedTopicMax] = useState(0);

  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState<ExamSettingsForm>({
    timeLimit: 10,
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
      console.log(response.data)
      setSettings({
        timeLimit: +data.timeLimit || 10,
        questionCount: data.questionCount || 30,
        attemptsAllowed: data.attemptsAllowed || 2,
      });
      dispatch(updateTestSettings({
        timeLimit: +data.timeLimit || 10,
        questionCount: data.questionCount || 30,
        attemptsAllowed: data.attemptsAllowed || 2,
      }))
      console.log(testSettings);
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
    if (testMode === 'practice') {
      const fetchQuestionCount = async () => {
        try {
          const response = await questionsApi.getQuestions({ limit: 1 });
          setAvailableQuestionsCount(response.data.data.totalCount || 0);
          
            dispatch(updateTestSettings({ 
              questionCount: response.data.data.totalCount 
            }));

        } catch (error) {
          console.error('Failed to fetch question count:', error);
          toast({
            title: "Ошибка",
            description: "Не удалось получить информацию о доступных вопросах",
            variant: "destructive"
          });
        }
      };
      
      fetchQuestionCount();
    }
  }, [testMode, toast, dispatch]);
  
  useEffect(() => {
    if (testMode === 'thematic') {
      const fetchTopics = async () => {
        setIsFetchingTopics(true);
        try {
          dispatch(fetchTests({}));
        } catch (error) {
          toast({
            title: "Ошибка загрузки тем",
            description: "Не удалось загрузить список доступных тем",
            variant: "destructive"
          });
        } finally {
          setIsFetchingTopics(false);
        }
      };
      
      fetchTopics();
    }
  }, [testMode, toast, dispatch]);

  // Update when selected topic changes
  useEffect(() => {
    if (selectedTopic && testMode === 'thematic') {
      const selectedTopicData = tests.find(test => test._id === selectedTopic);
      if (selectedTopicData) {
        setSelectedTopicMax(selectedTopicData.questionCount);
        if (testSettings.attemptsAllowed > selectedTopicData.questionCount) {
          if (selectedTopicData.questionCount == 1) {
             dispatch(updateTestSettings({ 
                attemptsAllowed: 1
              }));
          }
          else if (selectedTopicData.questionCount >= 2) {
                  dispatch(updateTestSettings({ 
                attemptsAllowed: 1
              }));
          }
        }
        dispatch(updateTestSettings({ 
          questionCount: selectedTopicData.questionCount
        }));
      }
    }
  }, [selectedTopic, tests, dispatch, testMode, testSettings.attemptsAllowed]);
  
  const handleStartTest = async () => {
    setIsLoading(true);
    
    try {
      if (testMode === 'practice') {
        await dispatch(fetchRandomQuestions(testSettings.questionCount)).unwrap();
      } else if (testMode === 'thematic' && selectedTopic) {
        await dispatch(fetchQuestionsForTopic({
          testId: selectedTopic,
          count: testSettings.questionCount
        })).unwrap();
      } else if (testMode === 'exam') {
        await fetchSettings();
        await dispatch(fetchQuestionsForExam(settings.questionCount)).unwrap();
      }
      
      dispatch(startQuiz());
    } catch (error) {
      console.error('Failed to start quiz:', error);
      toast({
        title: "Ошибка запуска теста",
        description: "Не удалось загрузить вопросы для теста",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (testMode === "exam") {
      fetchSettings();
    }
  }, [testMode]);
  
  const getModeTitle = (): string => {
    switch (testMode) {
      case 'practice':
        return 'Практика';
      case 'thematic':
        return 'Тематический тест';
      case 'exam':
        return 'Экзаменационный режим';
      default:
        return 'Выбор режима';
    }
  };
  
  const getModeDescription = (): string => {
    switch (testMode) {
      case 'practice':
        return 'Практика поможет вам подготовиться к экзамену с использованием случайных вопросов из базы.';
      case 'thematic':
        return 'Тематический тест позволяет проверить знания по конкретной теме.';
      case 'exam':
        return 'Экзаменационный режим имитирует настоящий экзамен с ограничением по времени.';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{getModeTitle()}</CardTitle>
          <p className="text-muted-foreground">{getModeDescription()}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {testMode === 'thematic' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="topic">Выберите тему</Label>
                  <Select
                    value={selectedTopic || undefined}
                    onValueChange={(value) => {
                      dispatch(setSelectedTopic(value));
                    }}
                    disabled={isFetchingTopics}
                  >
                    <SelectTrigger id="topic" className="w-full">
                      <SelectValue placeholder="Выберите тему для теста" />
                    </SelectTrigger>
                    <SelectContent>
                      {isFetchingTopics ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Загрузка...
                        </div>
                      ) : (
                        tests.filter((item) => item.questionCount > 0).map((topic) => (
                          <SelectItem key={topic._id} value={topic._id}>
                            {topic.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {selectedTopic && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="question-count" className="flex items-center">
                        <List className="h-4 w-4 mr-2" />
                        Количество вопросов
                        <span className="text-sm text-muted-foreground ml-2">
                          (доступно: {selectedTopicMax})
                        </span>
                      </Label>
                      <Input
                        id="question-count"
                        type="number"
                        min="1"
                        max={selectedTopicMax}
                        value={testSettings.questionCount}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          dispatch(updateTestSettings({
                            questionCount: Math.min(Math.max(1, value), selectedTopicMax)
                          }));
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Максимальное количество: {selectedTopicMax} вопросов
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="allowable-errors" className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Допустимо ошибок
                      </Label>
                      <Input
                        id="allowable-errors"
                        type="number"
                        min="0"
                        max={testSettings.questionCount}
                        value={testSettings.attemptsAllowed || 1}
                        onChange={(e) => dispatch(updateTestSettings({ 
                          attemptsAllowed: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="practice-mode" 
                        checked={isPracticeMode}
                        onCheckedChange={(checked) => {
                          dispatch(setIsPracticeMode(checked === true));
                        }}
                      />
                      <Label htmlFor="practice-mode">
                        Режим без учета ошибок
                      </Label>
                    </div>
                  </>
                )}
              </>  
            )}
            {testMode === "practice" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="question-count" className="flex items-center">
                    <List className="h-4 w-4 mr-2" />
                    Количество вопросов
                      <span className="text-sm text-muted-foreground ml-2">
                        (доступно: {availableQuestionsCount})
                      </span>
                  </Label>
                  <Input
                    id="question-count"
                    type="number"
                    min="1"
                    max={availableQuestionsCount}
                    value={testSettings.questionCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      const maxQuestions = availableQuestionsCount 
                      dispatch(updateTestSettings({ 
                        questionCount: Math.min(Math.max(1, value), maxQuestions)
                      }));
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                      'Рекомендуемое количество: 20-30 вопросов'
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowable-errors" className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Допустимо ошибок
                  </Label>
                  <Input
                    id="allowable-errors"
                    type="number"
                    min="0"
                    max={testSettings.questionCount}
                    value={testSettings.attemptsAllowed || 1}
                    onChange={(e) => dispatch(updateTestSettings({ 
                      attemptsAllowed: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="practice-mode" 
                    checked={isPracticeMode}
                    onCheckedChange={(checked) => {
                      dispatch(setIsPracticeMode(checked === true));
                    }}
                  />
                  <Label htmlFor="practice-mode">
                    Режим без учета ошибок
                  </Label>
                </div>
              </>
            )}
            {testMode === "exam" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="question-count" className="flex items-center">
                    <List className="h-4 w-4 mr-2" />
                    Количество вопросов
                  </Label>
                  <Input
                    id="question-count"
                    type="number"
                    value={settings.questionCount}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-limit" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Ограничение по времени (мин)
                  </Label>
                  <Input
                    id="time-limit"
                    type="number"
                    value={settings.timeLimit}
                     readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passing-score" className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Допустимо ошибок
                  </Label>
                  <Input
                    id="passing-score"
                    type="number"
                    value={settings.attemptsAllowed}
                    readOnly
                  />
                </div>
              </>
            )}           
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleStartTest} 
            className="w-full" 
            disabled={
              isLoading || 
              (testMode === 'thematic' && !selectedTopic)
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              'Начать тест'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestSettings;
