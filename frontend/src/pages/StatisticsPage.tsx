
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import UserStats from '@/components/statistics/UserStats';
import LatestTestResult from '@/components/dashboard/LatestTestResult';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Target, Award, BarChart } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { fetchLatestResult } from '@/store/slices/resultsSlice';
import { TestMode } from '@/types';

const StatisticsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Fetch latest result when tab changes
    const mode = activeTab !== 'all' ? activeTab as TestMode : undefined;
    dispatch(fetchLatestResult(mode));
  }, [dispatch, activeTab]);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Статистика успеваемости</h1>
          
          {/* Recent Test Result Section */}
          <div className="mb-8">
            <LatestTestResult mode={activeTab !== 'all' ? activeTab as TestMode : undefined} />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="all" className="flex items-center">
                <BarChart className="mr-2 h-4 w-4" />
                <span>Все тесты</span>
              </TabsTrigger>
              <TabsTrigger value="practice" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Практика</span>
              </TabsTrigger>
              <TabsTrigger value="thematic" className="flex items-center">
                <Target className="mr-2 h-4 w-4" />
                <span>Тематические</span>
              </TabsTrigger>
              <TabsTrigger value="exam" className="flex items-center">
                <Award className="mr-2 h-4 w-4" />
                <span>Экзамены</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <UserStats mode="all" />
            </TabsContent>
            <TabsContent value="practice">
              <UserStats mode="practice" />
            </TabsContent>
            <TabsContent value="thematic">
              <UserStats mode="thematic" />
            </TabsContent>
            <TabsContent value="exam">
              <UserStats mode="exam" />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default StatisticsPage;
