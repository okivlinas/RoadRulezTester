
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Home, BarChart2, User, LogOut, ClipboardList, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    window.location.href = '/auth';
  };
  
  const isAdmin = user?.role === 'admin';
  
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              Тесты ПДД
            </Link>
            
            {user && (
              <nav className="ml-10 hidden md:flex space-x-4">
                <Link to="/" className="py-2 px-3 rounded-md hover:bg-primary-foreground/10 transition-colors flex items-center">
                  <Home className="mr-1 h-4 w-4" />
                  Главная
                </Link>
                <Link to="/quiz" className="py-2 px-3 rounded-md hover:bg-primary-foreground/10 transition-colors flex items-center">
                  <ClipboardList className="mr-1 h-4 w-4" />
                  Тесты
                </Link>
                <Link to="/statistics" className="py-2 px-3 rounded-md hover:bg-primary-foreground/10 transition-colors flex items-center">
                  <BarChart2 className="mr-1 h-4 w-4" />
                  Статистика
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="py-2 px-3 rounded-md hover:bg-primary-foreground/10 transition-colors flex items-center">
                    <Settings className="mr-1 h-4 w-4" />
                    Админ
                  </Link>
                )}
              </nav>
            )}
          </div>
          
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Профиль</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/statistics">Статистика</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="ghost">
                <Link to="/auth">Войти</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
