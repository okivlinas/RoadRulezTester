import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import { useAppSelector } from '@/store';
import { questionsApi } from '@/api';

interface ExamSettingsForm {
  timeLimit: number;
  questionCount: number;
  attemptsAllowed: number;
}

const ExamSettings: React.FC = () => {
  const [settings, setSettings] = useState<ExamSettingsForm>({
    timeLimit: 30,
    questionCount: 20,
    attemptsAllowed: 10,
  });
  const { tests } = useAppSelector(state => state.tests);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [availableQuestionsCount, setAvailableQuestionsCount] = useState(0);
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/setting', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = response.data;
      console.log("data" + data)
      setSettings({
        timeLimit: data.timeLimit || 30,
        questionCount: data.questionCount || 20,
        attemptsAllowed: data.attemptsAllowed || 10,
      });
      const responseQ = await questionsApi.getQuestions({ limit: 1 });
      setAvailableQuestionsCount(responseQ.data.data.totalCount || 0);
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
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await axios.patch('http://localhost:3001/api/setting/update', settings, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      toast({
        title: 'Настройки сохранены',
        description: 'Настройки экзамена успешно обновлены.',
      });
    } catch (error) {
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось обновить настройки. Пожалуйста, попробуйте еще раз.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Настройки экзамена</h1>

      <Card>
        <CardHeader>
          <CardTitle>Настройки экзамена</CardTitle>
          <CardDescription>
           Эти настройки будут применяться ко всем тестам в режиме экзамена, пройденным учащимися
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Ограничение по времени (минуты)</Label>
                <Input
                  id="timeLimit"
                  name="timeLimit"
                  type="number"
                  min="1"
                  value={settings.timeLimit}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionCount">Количество вопросов</Label>
                <Input
                  id="questionCount"
                  name="questionCount"
                  type="number"
                  min="1"
                  max={availableQuestionsCount}
                  value={settings.questionCount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attemptsAllowed">Допустимое кол-во ошибок</Label>
                <Input
                  id="attemptsAllowed"
                  name="attemptsAllowed"
                  type="number"
                  min="1"
                  max={settings.questionCount}
                  value={settings.attemptsAllowed}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить настройки'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamSettings;
