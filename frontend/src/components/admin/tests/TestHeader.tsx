
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TestHeaderProps {
  onAddTest: () => void;
}

const TestHeader: React.FC<TestHeaderProps> = ({ onAddTest }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Управление темами</h1>
      <Button onClick={onAddTest}>
        <Plus className="h-4 w-4 mr-2" />
        Добавить тему
      </Button>
    </div>
  );
};

export default TestHeader;
