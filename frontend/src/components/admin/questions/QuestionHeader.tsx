
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface QuestionHeaderProps {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onAddQuestion: () => void;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  totalCount,
  currentPage,
  totalPages,
  onAddQuestion
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">Управление вопросами</h1>
        <p className="text-muted-foreground">
            Всего вопросов: {totalCount} | Страница {currentPage} из {Math.max(totalPages, 1)}
        </p>
      </div>
      <Button onClick={onAddQuestion}>
        <Plus className="h-4 w-4 mr-2" />
        Добавить вопрос
      </Button>
    </div>
  );
};

export default QuestionHeader;
