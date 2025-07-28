
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Test } from '@/types';

interface QuestionFiltersProps {
  searchQuery: string;
  selectedTestId: string;
  tests: Test[];
  onSearchChange: (value: string) => void;
  onTestChange: (value: string) => void;
}

const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  searchQuery,
  selectedTestId,
  tests,
  onSearchChange,
  onTestChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск вопросов..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="w-full sm:w-64">
        <Select value={selectedTestId} onValueChange={onTestChange}>
          <SelectTrigger>
            <SelectValue placeholder="Фильтр по тесту" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Все темы</SelectItem>
            {tests.map((test) => (
              <SelectItem key={test._id} value={test._id}>
                {test.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default QuestionFilters;
