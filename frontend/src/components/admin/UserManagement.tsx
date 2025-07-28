
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { UserRole } from '@/types';
import { Edit, Trash2, Plus, Search, ShieldAlert } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchUsers, 
  createUser,
  updateUser,
  deleteUser
} from '@/store/slices/usersSlice';

interface UserFormData {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, status, error } = useAppSelector(state => state.users);
  const { user: loggedInUser } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // Загружаем пользователей при монтировании компонента
  useEffect(() => {
    dispatch(fetchUsers({}));
  }, [dispatch]);
  
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleOpenAddDialog = () => {
    setFormError(null);
    setCurrentUser({
      name: '',
      email: '',
      password: '',
      role: 'student',
    });
    setIsDialogOpen(true);
  };
  
  const handleOpenEditDialog = (user: typeof users[0]) => {
    setFormError(null);
    setCurrentUser({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setIsDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentUser((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (value: string) => {
    setCurrentUser((prev) => ({ ...prev, role: value as UserRole }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    try {
      if (currentUser._id) {
        // Обновление существующего пользователя
        const userData = {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          ...(currentUser.password ? { password: currentUser.password } : {})
        };
        
        const resultAction = await dispatch(updateUser({
          _id: currentUser._id,
          userData
        }));
        
        if (updateUser.rejected.match(resultAction)) {
          // Обрабатываем ошибку дублирования email
          const errorMessage = resultAction.payload as string;
          if (errorMessage.includes('уже существует')) {
            setFormError('Пользователь с таким email уже существует');
            return;
          } else {
            throw new Error(errorMessage);
          }
        }
        
        toast({
          title: 'Пользователь обновлен',
          description: `Пользователь "${currentUser.name}" успешно обновлен.`,
        });
        setIsDialogOpen(false);
      } else {
        // Добавление нового пользователя
        const resultAction = await dispatch(createUser({
          name: currentUser.name,
          email: currentUser.email,
          password: currentUser.password,
          role: currentUser.role
        }));
        
        if (createUser.rejected.match(resultAction)) {
          // Обрабатываем ошибку дублирования email (код 409)
          const errorMessage = resultAction.payload as string;
          if (errorMessage.includes('уже существует')) {
            setFormError('Пользователь с таким email уже существует');
            return;
          } else {
            throw new Error(errorMessage);
          }
        }
        
        toast({
          title: 'Пользователь добавлен',
          description: `Пользователь "${currentUser.name}" успешно добавлен.`,
        });
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка при сохранении пользователя',
        variant: 'destructive',
      });
    }
  };
  
  const handleDelete = async () => {
    if (userToDelete) {
      try {
        const userToRemove = users.find((user) => user._id === userToDelete);
        await dispatch(deleteUser(userToDelete));
        
        toast({
          title: 'Пользователь удален',
          description: `Пользователь "${userToRemove?.name}" успешно удален.`,
        });
        
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: error instanceof Error ? error.message : 'Произошла ошибка при удалении пользователя',
          variant: 'destructive',
        });
      }
    }
  };

  // Function to check if a user is the current user
  const isCurrentUser = (userId: string) => loggedInUser?._id === userId;
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление пользователями</h1>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить пользователя
        </Button>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск пользователей..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {status === 'loading' && <div className="text-center py-8">Загрузка пользователей...</div>}
      
      {status === 'failed' && (
        <div className="text-center py-8 text-red-500">
          Ошибка: {error || 'Не удалось загрузить пользователей'}
        </div>
      )}
      
      {status === 'succeeded' && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead className="w-[100px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      {user.name}
                      {isCurrentUser(user._id) && (
                        <span className="inline-flex items-center ml-2 text-xs text-primary">
                          <ShieldAlert className="h-3 w-3 mr-1" />
                          Вы
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`capitalize ${user.role === 'admin' ? 'text-primary font-medium' : ''}`}>
                        {user.role === 'admin' ? 'Администратор' : 'Студент'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(user)}
                          disabled={isCurrentUser(user._id)}
                          title={isCurrentUser(user._id) ? "Нельзя редактировать свой профиль" : "Редактировать"}
                          className={isCurrentUser(user._id) ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Редактировать</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(user._id)}
                          disabled={isCurrentUser(user._id)}
                          title={isCurrentUser(user._id) ? "Нельзя удалить свой аккаунт" : "Удалить"}
                          className={isCurrentUser(user._id) ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Удалить</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    По вашему запросу не найдено пользователей.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentUser._id ? 'Редактировать пользователя' : 'Добавить пользователя'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Полное имя</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Введите полное имя"
                  value={currentUser.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Введите email адрес"
                  value={currentUser.email}
                  onChange={handleInputChange}
                  required
                />
                {formError && (
                  <p className="text-sm text-red-500 mt-1">{formError}</p>
                )}
              </div>
              {!currentUser._id && (
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    minLength={6}
                    placeholder="Задайте пароль"
                    value={currentUser.password}
                    onChange={handleInputChange}
                    required={!currentUser._id}
                  />
                </div>
              )}
              {currentUser._id && (
                <div className="space-y-2">
                  <Label htmlFor="password">Новый пароль</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Оставьте пустым, чтобы не менять"
                    value={currentUser.password}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">Роль</Label>
                <Select
                  value={currentUser.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Студент</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">
                {currentUser._id ? 'Сохранить изменения' : 'Добавить пользователя'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтвердите удаление</DialogTitle>
          </DialogHeader>
          <p>
            Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
