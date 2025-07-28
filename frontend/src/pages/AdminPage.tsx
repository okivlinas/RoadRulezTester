
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import UserManagement from '@/components/admin/UserManagement';
import TestManagement from '@/components/admin/TestManagement';
import QuestionManagement from '@/components/admin/QuestionManagement';
import ExamSettings from '@/components/admin/ExamSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Settings, HelpCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  
  // Redirect if not authenticated or not an admin
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Панель администратора</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <ScrollArea className="sm:hidden">
              <TabsList className="inline-flex h-10 w-full min-w-[400px] items-center justify-center p-1">
                <TabsTrigger value="users" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Пользователи</span>
                </TabsTrigger>
                <TabsTrigger value="tests" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Темы</span>
                </TabsTrigger>
                <TabsTrigger value="questions" className="flex items-center">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Вопросы</span>
                </TabsTrigger>
                <TabsTrigger value="exam-settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Настройки экзамена</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
            
            <TabsList className="hidden sm:grid grid-cols-4 mb-8">
              <TabsTrigger value="users" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>Пользователи</span>
              </TabsTrigger>
              <TabsTrigger value="tests" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                <span>Темы</span>
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex items-center">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Вопросы</span>
              </TabsTrigger>
              <TabsTrigger value="exam-settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Настройки экзамена</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
            <TabsContent value="tests">
              <TestManagement />
            </TabsContent>
            <TabsContent value="questions">
              <QuestionManagement />
            </TabsContent>
            <TabsContent value="exam-settings">
              <ExamSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
