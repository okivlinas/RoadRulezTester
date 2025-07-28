
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { TestMode } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TestFormData {
  _id?: string;
  title: string;
  description: string;
  questionCount: number;
  mode: TestMode;
  imageBase64?: string;
}

interface TestFormProps {
  test: TestFormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onModeChange: (mode: TestMode) => void;
  onImageChange: (imageData: { imageBase64?: string }) => void;
  onCancel: () => void;
}

const TestForm: React.FC<TestFormProps> = ({
  test,
  onSubmit,
  onChange,
  onCancel
}) => {
  const [uploading, setUploading] = useState(false);

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
      <ScrollArea className="flex-grow pr-4">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название темы</Label>
            <Input
              id="title"
              name="title"
              placeholder="Введите название темы"
              value={test.title}
              onChange={onChange}
              required
            />
          </div>
                    
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Введите описание темы"
              value={test.description}
              onChange={onChange}
              required
            />
          </div>
        </div>
      </ScrollArea>
      
      <DialogFooter className="mt-4 flex-shrink-0 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={uploading}>
          {test._id ? 'Сохранить изменения' : 'Добавить тему'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default TestForm;
