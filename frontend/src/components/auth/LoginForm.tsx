import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/store';
import { EyeIcon, EyeOffIcon, BugIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { testAuthRequests } from '@/utils/apiDebug';

interface LoginFormProps {
  onSwitch: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isDebug, setIsDebug] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const { status, error } = useAppSelector(state => state.auth);
  
  useEffect(() => {
    if (loginError) {
      setLoginError(null);
    }
  }, [email, loginError, password]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    try {
      await login(email, password);
      toast({
        title: 'Успешный вход',
        description: 'Добро пожаловать в систему!',
      });
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setLoginError(errorMessage);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('🔍 Login error details:', {
          message: errorMessage,
          timestamp: new Date().toISOString()
        });
        
        testAuthRequests().catch(console.error);
      }
      
      toast({
        title: 'Ошибка входа',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
    
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Вход в систему</CardTitle>
        <CardDescription>
          Введите свои учетные данные для входа в аккаунт
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loginError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@mail.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Пароль</Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                <span className="sr-only">
                  {showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                </span>
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-sm text-center text-muted-foreground">
          <span className="mr-1">Нет аккаунта?</span>
          <Button variant="link" className="p-0 h-auto" onClick={onSwitch}>
            Зарегистрироваться
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
