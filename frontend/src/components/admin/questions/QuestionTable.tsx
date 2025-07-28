
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Eye, Image } from 'lucide-react';
import { Question, Test } from '@/types';

interface QuestionTableProps {
  questions: Question[];
  tests: Test[];
  searchQuery: string;
  selectedTestId: string;
  onViewQuestion: (question: Question) => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
}

const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  tests,
  searchQuery,
  selectedTestId,
  onViewQuestion,
  onEditQuestion,
  onDeleteQuestion
}) => {
  const getTestTitle = (testId?: string) => {
    if (!testId) return 'Не привязан к теме';
    const test = tests.find(t => t._id === testId);
    return test ? test.title : 'Неизвестная тема';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Вопрос</TableHead>
            <TableHead>Тест</TableHead>
            <TableHead>Изображение</TableHead>
            <TableHead>Варианты ответов</TableHead>
            <TableHead className="w-[120px]">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.length > 0 ? (
            questions.map((question) => (
              <TableRow key={question._id}>
                <TableCell className="font-medium">
                  {question.text.length > 50 
                    ? `${question.text.substring(0, 50)}...` 
                    : question.text}
                </TableCell>
                <TableCell>{getTestTitle(question.testId)}</TableCell>
                <TableCell>
                  {question.imageBase64 ? (
                    <div className="h-8 w-8 bg-muted flex items-center justify-center rounded">
                      <Image className="h-4 w-4" />
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Нет</span>
                  )}
                </TableCell>
                <TableCell>
                  {question.options.length} вариантов, 
                  {question.options.filter(o => o.isCorrect).length} правильных
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewQuestion(question)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Просмотр</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditQuestion(question)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Изменить</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteQuestion(question._id)}
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
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                {searchQuery || selectedTestId !== '0' 
                  ? 'Нет вопросов, соответствующих вашему поиску.' 
                  : 'Нет доступных вопросов.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuestionTable;
