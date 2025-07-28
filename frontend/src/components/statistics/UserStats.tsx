
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchUserStats } from '@/store/slices/resultsSlice';
import { fetchUserResults } from '@/store/slices/resultsSlice';
import { TestMode } from '@/types';

interface UserStatsProps {
  mode: TestMode | 'all';
}

const UserStats: React.FC<UserStatsProps> = ({ mode }) => {
  const dispatch = useAppDispatch();
  const { userStats, results, status } = useAppSelector(state => state.results);
  
  useEffect(() => {
    // Загрузка статистики
    dispatch(fetchUserStats({ mode: mode === 'all' ? undefined : mode }));
    
    // Загрузка последних результатов
    dispatch(fetchUserResults({ limit: 5 }));
  }, [dispatch, mode]);
  
  // Данные для круговой диаграммы успешности тестов
  const pieData = userStats ? [
    { name: 'Пройдено', value: userStats.testsPassed, color: '#4ade80' },
    { name: 'Не пройдено', value: userStats.totalTests - userStats.testsPassed, color: '#f87171' },
  ] : [];
  
  // Данные для столбчатой диаграммы (последние 5 тестов)
  const barData = results?.slice(0, 5).map(result => ({
    id: result._id,
    name: formatDate(result.date),
    score: result.score,
    passed: result.passed,
  })).reverse() || [];
  
  if (status === 'loading') {
    return <div className="text-center py-8">Загрузка статистики...</div>;
  }
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Общая информация</CardTitle>
        </CardHeader>
        <CardContent>
          {!userStats || userStats.totalTests === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет данных для отображения. Пройдите хотя бы один тест.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-md text-center">
                  <h3 className="text-3xl font-bold text-primary">{userStats.totalTests}</h3>
                  <p className="text-sm text-muted-foreground">Всего тестов</p>
                </div>
                <div className="bg-muted p-4 rounded-md text-center">
                  <h3 className="text-3xl font-bold text-primary">
                    {userStats.correctAnswerPercentage.toFixed(1)}%
                  </h3>
                  <p className="text-sm text-muted-foreground">Правильных ответов</p>
                </div>
                <div className="bg-muted p-4 rounded-md text-center">
                  <h3 className="text-3xl font-bold text-primary">
                    {userStats.testsPassed} / {userStats.totalTests}
                  </h3>
                  <p className="text-sm text-muted-foreground">Пройдено тестов</p>
                </div>
              </div>
              
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Test Results Chart */}
      {results && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Последние результаты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="score" 
                    name="Балл (%)" 
                    fill="#8884d8"
                    barSize={20}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Вспомогательные функции
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const formatDate = (date: Date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
};

export default UserStats;
