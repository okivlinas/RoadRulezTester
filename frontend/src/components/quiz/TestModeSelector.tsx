
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Award } from 'lucide-react';
import { TestMode } from '@/types';
import { useAppDispatch } from '@/store';
import { setTestMode } from '@/store/slices/quizSlice';

const modeDetails = {
  practice: {
    title: 'Режим практики',
    description: 'Тренируйтесь в своем темпе с немедленной обратной связью после каждого вопроса',
    icon: <BookOpen className="h-10 w-10 mb-2 text-primary" />,
  },
  thematic: {
    title: 'Тематический режим',
    description: 'Сосредоточьтесь на конкретных темах или категориях правил дорожного движения',
    icon: <Target className="h-10 w-10 mb-2 text-primary" />,
  },
  exam: {
    title: 'Экзаменационный режим',
    description: 'Имитируйте реальный опыт сдачи экзамена по вождению с ограничением по времени',
    icon: <Award className="h-10 w-10 mb-2 text-primary" />,
  },
};

const TestModeSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const handleSelectMode = (mode: TestMode) => {
    dispatch(setTestMode(mode));
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Выберите режим теста</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['practice', 'thematic', 'exam'] as TestMode[]).map((mode) => (
          <Card key={mode} className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center">
                {modeDetails[mode].icon}
              </div>
              <CardTitle>{modeDetails[mode].title}</CardTitle>
              <CardDescription>{modeDetails[mode].description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {mode === 'practice' && (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Неограниченное время на вопрос</li>
                  <li>Мгновенная обратная связь</li>
                  <li>Объяснение правильных ответов</li>
                  <li>Настраиваемое количество вопросов</li>
                  <li>Неотвечнный вопрос - ошибка</li>
                </ul>
              )}
              {mode === 'thematic' && (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Фокус на конкретных категориях правил</li>
                  <li>Настраиваемое количество вопросов</li>
                  <li>Настраиваемое количество ошибок</li>
                  <li>Детальный разбор по темам</li>
                  <li>Неотвечнный вопрос - ошибка</li>
                </ul>
              )}
              {mode === 'exam' && (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Фиксированное время</li>
                  <li>Стандартный формат экзамена</li>
                  <li>Неотвечнный вопрос - ошибка</li>
                </ul>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleSelectMode(mode)}
              >
                Выбрать {modeDetails[mode].title}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestModeSelector;
