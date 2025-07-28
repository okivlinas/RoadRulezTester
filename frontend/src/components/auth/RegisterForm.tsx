
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/store';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface RegisterFormProps {
  onSwitch: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitch }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { register } = useAuth();
  const { toast } = useToast();
  const { status } = useAppSelector(state => state.auth);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous errors
    setEmailError('');
    
    if (password !== passwordConfirm) {
      toast({
        title: 'Ошибка валидации',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await register(name, email, password);
      toast({
        title: 'Регистрация прошла успешно',
        description: 'Ваш аккаунт был успешно создан.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      
      // Check for email already in use error
      if (errorMessage.includes('Email already in use')) {
        setEmailError('Этот email уже используется');
        toast({
          title: 'Ошибка регистрации',
          description: 'Этот email уже используется',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Ошибка регистрации',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Регистрация</CardTitle>
        <CardDescription>
          Создайте новый аккаунт для доступа к системе
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Полное имя</Label>
            <Input
              id="name"
              placeholder="Иванов Иван"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@mail.ru"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              className={emailError ? 'border-red-500' : ''}
              required
            />
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Подтверждение пароля</Label>
            <Input
              id="passwordConfirm"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={6}
            />

          </div>
          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-sm text-center text-muted-foreground">
          <span className="mr-1">Уже есть аккаунт?</span>
          <Button variant="link" className="p-0 h-auto" onClick={onSwitch}>
            Войти
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
