
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { TestMode } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  fetchTests, 
  createTest, 
  updateTest,
  deleteTest
} from '@/store/slices/testsSlice';
import { useApi } from '@/hooks/useApi';

import TestHeader from './tests/TestHeader';
import SearchBar from './tests/SearchBar';
import TestTable from './tests/TestTable';
import AddEditTestDialog from './tests/AddEditTestDialog';
import DeleteTestDialog from './tests/DeleteTestDialog';

interface TestFormData {
  _id?: string;
  title: string;
  description: string;
  questionCount: number;
  mode: TestMode;
  imageBase64?: string;
}

// Define interface for toast-only errors to use in type checking
interface ToastOnlyError {
  isToastOnly: true;
  message: string;
}

const initialTestFormData: TestFormData = {
  title: '',
  description: '',
  questionCount: 0,
  mode: 'thematic',
  imageBase64: '',
};

const TestManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tests, status, error, totalCount } = useAppSelector(state => state.tests);
  const { callApi, loading } = useApi();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<TestFormData>(initialTestFormData);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();
  
  // Load tests on component mount
  useEffect(() => {
    loadTests();
  }, []);
  
  const loadTests = useCallback(() => {
    dispatch(fetchTests({}));
  }, [dispatch]);
  
  // Dialog handlers
  const handleOpenAddDialog = () => {
    setCurrentTest(initialTestFormData);
    setIsDialogOpen(true);
  };
  
  const handleOpenEditDialog = (test: any) => {
    setCurrentTest({
      _id: test._id,
      title: test.title,
      description: test.description,
      questionCount: test.questionCount,
      mode: test.mode,
      imageBase64: test.imageBase64 || '',
    });
    setIsDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (testId: string) => {
    setTestToDelete(testId);
    setIsDeleteDialogOpen(true);
  };
  
  // Form input handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentTest((prev) => ({ 
      ...prev, 
      [name]: name === 'questionCount' ? parseInt(value) || 0 : value 
    }));
  };
  
  const handleModeChange = (mode: TestMode) => {
    setCurrentTest((prev) => ({ ...prev, mode }));
  };
  
  const handleImageChange = ({ imageBase64 }: { imageBase64?: string }) => {
    setCurrentTest((prev) => ({ 
      ...prev, 
      imageBase64,
    }));
  };
  
  // Submit handler - create or update test
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;
    setSubmitting(true);
    
    try {
      if (currentTest._id) {
        // Update existing test
        const resultAction = await dispatch(updateTest({
          _id: currentTest._id,
          testData: currentTest
        }));
        
        if (updateTest.fulfilled.match(resultAction)) {
          toast({
            title: 'Тест обновлен',
            description: `Тест "${currentTest.title}" успешно обновлен.`,
          });
          setIsDialogOpen(false);
        } else {
          const errorPayload = resultAction.payload;
          
          // Handle the toast-only error case with proper type checking
          if (errorPayload && typeof errorPayload === 'object' && 'isToastOnly' in errorPayload) {
            // TypeScript now knows this is a ToastOnlyError with a message property
            const toastError = errorPayload as ToastOnlyError;
            toast({
              title: 'Ошибка',
              description: toastError.message || 'Произошла ошибка при обновлении теста',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Ошибка',
              description: typeof errorPayload === 'string' ? errorPayload : 'Произошла ошибка при обновлении теста',
              variant: 'destructive',
            });
          }
        }
      } else {
        // Add new test
        const resultAction = await dispatch(createTest(currentTest));
        
        if (createTest.fulfilled.match(resultAction)) {
          toast({
            title: 'Тест добавлен',
            description: `Тест "${currentTest.title}" успешно добавлен.`,
          });
          setIsDialogOpen(false);
        } else {
          const errorPayload = resultAction.payload;
          
          // Handle the toast-only error case with proper type checking
          if (errorPayload && typeof errorPayload === 'object' && 'isToastOnly' in errorPayload) {
            // TypeScript now knows this is a ToastOnlyError with a message property
            const toastError = errorPayload as ToastOnlyError;
            toast({
              title: 'Ошибка',
              description: toastError.message || 'Произошла ошибка при создании теста',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Ошибка',
              description: typeof errorPayload === 'string' ? errorPayload : 'Произошла ошибка при создании теста',
              variant: 'destructive',
            });
          }
        }
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка при сохранении теста',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete handler
  const handleDelete = async () => {
    if (testToDelete) {
      try {
        const testToRemove = tests.find((test) => test._id === testToDelete);
        
        if (testToRemove) {
          // Check if test has an image before deleting
          const hasImage = testToRemove.imageBase64 && testToRemove.imageBase64.length > 0;
          
          if (hasImage) {
            await callApi(async () => {
              await dispatch(deleteTest(testToDelete));
              return null;
            });
          } else {
            await dispatch(deleteTest(testToDelete));
          }
          
          toast({
            title: 'Тест удален',
            description: `Тест "${testToRemove.title}" успешно удален.`,
          });
        }
        
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: error instanceof Error ? error.message : 'Произошла ошибка при удалении теста',
          variant: 'destructive',
        });
      }
    }
  };

  // Safely filter tests, ensuring we have valid data
  const filteredTests = Array.isArray(tests) 
    ? tests.filter(test => {
        // Make sure the test object exists before accessing
        return test && (
          (test.title && typeof test.title === 'string' && test.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (test.description && typeof test.description === 'string' && test.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
    : [];

  return (
    <div className="container mx-auto py-6 px-4 min-h-screen overflow-y-auto">
      <TestHeader onAddTest={handleOpenAddDialog} />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {status === "loading" ? (
        <div className="text-center py-8">Загрузка тем...</div>
      ) : (
        <div className="space-y-4">
          <TestTable 
            tests={filteredTests} 
            onEdit={handleOpenEditDialog} 
            onDelete={handleOpenDeleteDialog} 
          />
        </div>
      )}
      
      <AddEditTestDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        test={currentTest}
        onInputChange={handleInputChange}
        onModeChange={handleModeChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
      />
      
      <DeleteTestDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default TestManagement;
