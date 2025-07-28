
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface DeleteTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  itemType?: 'theme' | 'test';
}

const DeleteTestDialog: React.FC<DeleteTestDialogProps> = ({ 
  isOpen, 
  onClose, 
  onDelete, 
  itemType = 'theme' 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтвердить удаление</DialogTitle>
        </DialogHeader>
        <p>
          Вы уверены, что хотите удалить эту {itemType === 'theme' ? 'тему' : 'тест'}? Это действие невозможно отменить.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTestDialog;
