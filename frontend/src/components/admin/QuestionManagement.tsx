
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Question } from '@/types';
import QuestionForm from './QuestionForm';
import { useToast } from '@/components/ui/use-toast';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  fetchQuestions, 
  createQuestion, 
  updateQuestion as updateQuestionAction,
  deleteQuestion as deleteQuestionAction 
} from '@/store/slices/questionsSlice';
import { fetchTests } from '@/store/slices/testsSlice';
import QuestionHeader from './questions/QuestionHeader';
import QuestionFilters from './questions/QuestionFilters';
import QuestionTable from './questions/QuestionTable';
import QuestionPagination from './questions/QuestionPagination';
import QuestionViewDialog from './questions/QuestionViewDialog';
import QuestionDeleteDialog from './questions/QuestionDeleteDialog';

const QuestionManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { questions, status, error, totalCount } = useAppSelector(state => state.questions);
  const { tests } = useAppSelector(state => state.tests);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('0'); // '0' means all tests
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Show 50 questions per page
  
  const { toast } = useToast();
  
  // Load questions and tests on component mount and when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      ...(searchQuery && { search: searchQuery }),
      ...(selectedTestId !== '0' && { testId: selectedTestId })
    };
    
    dispatch(fetchQuestions(params));
  }, [dispatch, currentPage, itemsPerPage, searchQuery, selectedTestId]);
  
  // Load tests on component mount
  useEffect(() => {
    dispatch(fetchTests({}));
  }, [dispatch]);
  
  // Reset to first page when search query or test filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTestId]);
  
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  const handleOpenAddForm = () => {
    setCurrentQuestion(null);
    setIsFormOpen(true);
  };
  
  const handleOpenEditForm = (question: Question) => {
    setCurrentQuestion(question);
    setIsFormOpen(true);
  };
  
  const handleOpenViewDialog = (question: Question) => {
    setCurrentQuestion(question);
    setIsViewDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (questionId: string) => {
    setQuestionToDelete(questionId);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSaveQuestion = (questionData: any) => {
    try {
      if (questionData._id) {
        dispatch(updateQuestionAction({
          id: questionData._id,
          questionData: {
            text: questionData.text,
            options: questionData.options,
            explanation: questionData.explanation,
            imageBase64: questionData.imageBase64,
            testId: questionData.testId
          }
        }));
        
        toast({
          title: 'Вопрос обновлен',
          description: 'Вопрос успешно обновлен.',
        });
      } else {
        // Add new question
        dispatch(createQuestion({
          text: questionData.text,
          options: questionData.options,
          explanation: questionData.explanation,
          imageBase64: questionData.imageBase64,
          testId: questionData.testId
        }));
        
        toast({
          title: 'Вопрос добавлен',
          description: 'Вопрос успешно добавлен.',
        });
      }
      
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка при сохранении вопроса',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteQuestion = () => {
    if (questionToDelete) {
      try {
        dispatch(deleteQuestionAction(questionToDelete));
        setIsDeleteDialogOpen(false);
        
        toast({
          title: 'Вопрос удален',
          description: 'Вопрос успешно удален.',
        });
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: error instanceof Error ? error.message : 'Произошла ошибка при удалении вопроса',
          variant: 'destructive',
        });
      }
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <QuestionHeader
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onAddQuestion={handleOpenAddForm}
      />
      
      <QuestionFilters
        searchQuery={searchQuery}
        selectedTestId={selectedTestId}
        tests={tests}
        onSearchChange={setSearchQuery}
        onTestChange={setSelectedTestId}
      />
      
      {status === "loading" ? (
        <div className="text-center py-8">Загрузка вопросов...</div>
      ) : status === "failed" ? (
        <div className="text-center py-8 text-red-500">
          Ошибка: {error || 'Не удалось загрузить вопросы'}
        </div>
      ) : (
        <>
          <QuestionTable
            questions={questions}
            tests={tests}
            searchQuery={searchQuery}
            selectedTestId={selectedTestId}
            onViewQuestion={handleOpenViewDialog}
            onEditQuestion={handleOpenEditForm}
            onDeleteQuestion={handleOpenDeleteDialog}
          />
          
          <QuestionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      
      {/* Add/Edit Question Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{currentQuestion ? 'Редактировать вопрос' : 'Добавить новый вопрос'}</DialogTitle>
          </DialogHeader>
          <QuestionForm
            questionId={currentQuestion?._id}
            initialData={currentQuestion || undefined}
            tests={tests}
            onSave={handleSaveQuestion}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* View Question Dialog */}
      <QuestionViewDialog
        question={currentQuestion}
        tests={tests}
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
      />
      
      {/* Delete Confirmation Dialog */}
      <QuestionDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteQuestion}
      />
    </div>
  );
};

export default QuestionManagement;
