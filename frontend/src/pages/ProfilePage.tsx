/* eslint-disable react-hooks/rules-of-hooks */

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCurrentUser, updateProfile } from '@/store/slices/authSlice';
import { fetchUserStats } from '@/store/slices/resultsSlice';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { User } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const { status: authStatus } = useAppSelector(state => state.auth);
  const { userStats } = useAppSelector(state => state.results);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  // Загрузка статистики пользователя при монтировании
  useEffect(() => {
    dispatch(fetchUserStats({}));
  }, [dispatch]);
  
  // Обновление формы при изменении данных пользователя
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);
  
  const isSubmitting = authStatus === 'loading';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      toast({
        title: 'Ошибка валидации',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const userData: { name?: string; email?: string; password?: string } = {};
      
      if (name !== user?.name) userData.name = name;
      if (email !== user?.email) userData.email = email;
      if (password) userData.password = password;
      
      const resultAction = await dispatch(updateProfile(userData));
      
      if (updateProfile.fulfilled.match(resultAction)) {
                dispatch(fetchCurrentUser());
        toast({
          title: 'Успех',
          description: 'Ваш профиль успешно обновлен',
        });
        
        setIsEditing(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: 'Ошибка обновления',
          description: resultAction.payload as string,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка обновления',
        description: error instanceof Error ? error.message : 'Произошла неизвестная ошибка',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Мой профиль</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Сводка профиля</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                  <div className="mt-4 text-sm w-full">
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Роль:</span>
                      <span className="capitalize">{user?.role === 'admin' ? 'Администратор' : 'Студент'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-medium">Пройдено тестов:</span>
                      <span>{userStats?.totalTests || 0}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "outline" : "default"}
                  >
                    {isEditing ? "Отменить редактирование" : "Редактировать профиль"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Информация профиля</CardTitle>
                  <CardDescription>
                    {isEditing 
                      ? "Обновите вашу личную информацию и пароль" 
                      : "Просмотр ваших личных данных"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Полное имя</Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isEditing || isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditing || isSubmitting}
                      />
                    </div>
                    
                    {isEditing && (
                      <>
                        <div className="pt-4 border-t">
                          <h3 className="text-lg font-medium mb-4">Сменить пароль</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="password">Новый пароль</Label>
                              <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                              />
                              <p className="text-xs text-muted-foreground">
                                Оставьте пустым, чтобы сохранить текущий пароль
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Подтверждение нового пароля</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                          </Button>
                        </div>
                      </>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
