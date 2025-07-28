
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, BarChart, Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchLatestResult } from '@/store/slices/resultsSlice';
import { TestMode } from '@/types';

interface LatestTestResultProps {
  mode?: TestMode;
}

const LatestTestResult: React.FC<LatestTestResultProps> = ({ mode }) => {
  const dispatch = useAppDispatch();
  const { latestResult, status } = useAppSelector(state => state.results);
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchLatestResult(mode));
    }
  }, [dispatch, user, mode]);

  const getTestModeLabel = (mode: TestMode): string => {
    switch (mode) {
      case 'practice': return 'Практика';
      case 'thematic': return 'Тематический тест';
      case 'exam': return 'Экзаменационный тест';
      default: return 'Тест';
    }
  };

  const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log("Latest result data:", latestResult); // Debug to see what data we're receiving

  if (status === 'loading') {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="bg-muted h-6 w-3/4 rounded"></CardTitle>
          <CardDescription className="bg-muted h-4 w-1/2 rounded mt-2"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted h-20 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!latestResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Последний пройденный тест</CardTitle>
          <CardDescription>
            {mode ? `Режим: ${getTestModeLabel(mode)}` : 'Все режимы'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Пройдите тест в этом режиме, чтобы увидеть здесь результаты
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последний пройденный тест</CardTitle>
        <CardDescription>
          {getTestModeLabel(latestResult.testMode as TestMode)} • {formatDate(latestResult.date)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {latestResult.passed ? (
              <CheckCircle className="h-10 w-10 text-green-500 mr-3" />
            ) : (
              <XCircle className="h-10 w-10 text-red-500 mr-3" />
            )}
            <div>
              <p className="font-semibold text-lg">
                {latestResult.passed ? 'Тест пройден' : 'Тест не пройден'}
              </p>
              <p className="text-sm text-muted-foreground">
                Правильных ответов: {latestResult.correctAnswers} из {latestResult.totalQuestions}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {latestResult.score.toFixed(0)}%
            </p>
            <p className="text-sm text-muted-foreground">
              Результат
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LatestTestResult;
