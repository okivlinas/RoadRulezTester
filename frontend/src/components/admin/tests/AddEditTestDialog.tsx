
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TestForm from './TestForm';
import { TestMode } from '@/types';

interface TestFormData {
  _id?: string;
  title: string;
  description: string;
  questionCount: number;
  mode: TestMode;
  imageBase64?: string;
}

interface AddEditTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  test: TestFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onModeChange: (mode: TestMode) => void;
  onImageChange: (imageData: { imageBase64?: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AddEditTestDialog: React.FC<AddEditTestDialogProps> = ({
  isOpen,
  onClose,
  test,
  onInputChange,
  onModeChange,
  onImageChange,
  onSubmit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{test._id ? 'Редактирование темы' : 'Добавление новой темы'}</DialogTitle>
        </DialogHeader>
        <TestForm
          test={test}
          onChange={onInputChange}
          onModeChange={onModeChange}
          onImageChange={onImageChange}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddEditTestDialog;
