import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { TestMode } from '@/types';

interface Test {
  _id: string;
  title: string;
  description: string;
  questionCount: number;
  mode: TestMode;
  imageBase64?: string;
}

interface TestTableProps {
  tests: Test[];
  onEdit: (test: Test) => void;
  onDelete: (testId: string) => void;
}

const TestTable: React.FC<TestTableProps> = ({ tests, onEdit, onDelete }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead>Вопросы</TableHead>
            <TableHead>Режим</TableHead>
            <TableHead className="w-[100px]">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests.length > 0 ? (
            tests.map((test) => (
              <TableRow key={test._id}>
                <TableCell className="font-medium">{test.title}</TableCell>
                <TableCell>{test.description}</TableCell>
                <TableCell>{test.questionCount}</TableCell>
                <TableCell>
                  <span className={`capitalize ${
                    test.mode === 'exam' 
                      ? 'text-primary font-medium' 
                      : test.mode === 'thematic' 
                        ? 'text-amber-600' 
                        : ''
                  }`}>
                    {test.mode}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(test)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(test._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No tests found matching your search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TestTable;
