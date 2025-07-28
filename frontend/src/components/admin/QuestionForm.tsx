
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Upload, Image, Plus, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Test } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { Switch } from '@/components/ui/switch';

interface Option {
  _id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionFormProps {
  questionId?: string;
  onSave: (question: any) => void;
  onCancel: () => void;
  tests: Test[];
  initialData?: {
    _id?: string;
    text: string;
    imageBase64?: string;
    options: Option[];
    explanation: string;
    testId?: string;
    isMultipleChoice?: boolean;
  };
}

const defaultOptions = [
  { _id: 'a', text: '', isCorrect: false },
  { _id: 'b', text: '', isCorrect: false },
  { _id: 'c', text: '', isCorrect: false },
  { _id: 'd', text: '', isCorrect: false },
];

const QuestionForm: React.FC<QuestionFormProps> = ({
  questionId,
  onSave,
  onCancel,
  tests,
  initialData
}) => {
  const [questionText, setQuestionText] = useState(initialData?.text || '');
  const [imageBase64, setImageBase64] = useState(initialData?.imageBase64 || '');
  const [testId, setTestId] = useState(initialData?.testId || '');
  const [options, setOptions] = useState<Option[]>(
    initialData?.options || [...defaultOptions]
  );
  const [isMultipleChoice, setIsMultipleChoice] = useState(initialData?.isMultipleChoice || false);
  const [explanation, setExplanation] = useState(initialData?.explanation || '');
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageBase64 || null);
  const { toast } = useToast();
  
  const handleOptionChange = (optionId: string, field: 'text' | 'isCorrect', value: string | boolean) => {
    setOptions(prevOptions =>
      prevOptions.map(option =>
        option._id === optionId
          ? { ...option, [field]: value }
          : isMultipleChoice ? option : field === 'isCorrect' && value === true
            ? { ...option, isCorrect: false }
            : option
      )
    );
  };

  const addOption = () => {
    if (options.length >= 6) {
      toast({
        title: "Достигнут максимум",
        description: "Максимальное количество вариантов ответа: 6",
        variant: "destructive",
      });
      return;
    }

    // Generate a new option ID
    const lastOption = options[options.length - 1]._id;
    const nextOptionChar = String.fromCharCode(lastOption.charCodeAt(0) + 1);
    
    setOptions([...options, { _id: nextOptionChar, text: '', isCorrect: false }]);
  };

  const removeOption = (optionId: string) => {
    if (options.length <= 2) {
      toast({
        title: "Необходимый минимум",
        description: "Минимальное количество вариантов ответа: 2",
        variant: "destructive",
      });
      return;
    }

    setOptions(options.filter(option => option._id !== optionId));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64('');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!questionText) {
      toast({
        title: "Ошибка",
        description: "Текст вопроса обязателен",
        variant: "destructive",
      });
      return;
    }
  
    if (!testId) {
      toast({
        title: "Ошибка",
        description: "Выберите тему",
        variant: "destructive",
      });
      return;
    }
  
    if (!options.some(option => option.isCorrect)) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, отметьте хотя бы один вариант как правильный",
        variant: "destructive",
      });
      return;
    }
  
    if (options.some(option => !option.text)) {
      toast({
        title: "Ошибка",
        description: "Все варианты ответов должны содержать текст",
        variant: "destructive",
      });
      return;
    }
  
    if (!explanation) {
      toast({
        title: "Ошибка",
        description: "Объяснение обязательно",
        variant: "destructive",
      });
      return;
    }
  
    const questionData = {
      _id: questionId,
      text: questionText,
      imageBase64: imageBase64 || undefined,
      options,
      explanation,
      testId: testId || undefined,
      isMultipleChoice,
    };
    
    onSave(questionData);
  };
  
  return (
    <ScrollArea className="h-[80vh] pr-4">
      <form onSubmit={handleSubmit} className="space-y-6 px-1">
        <div className="space-y-3">
          <Label htmlFor="questionText">Текст вопроса</Label>
          <Textarea
            id="questionText"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Введите текст вопроса"
            className="min-h-[100px]"
            required
          />
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="testId">Привязать к теме</Label>
          <Select
            value={testId}
            onValueChange={setTestId}
            required
          >
            <SelectTrigger id="testId">
              <SelectValue placeholder="Выберите тему" />
            </SelectTrigger>
            <SelectContent>
              {tests.map((test) => (
                <SelectItem key={test._id} value={test._id}>
                  {test.title} ({test.mode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Привязка к теме обязательна
          </p>
        </div>
        
        <div className="space-y-3">
          <Label>Изображение для вопроса (Опционально)</Label>
          <div className="border rounded-md p-4">
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Question" 
                  className="max-h-[200px] mx-auto rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center p-8">
                <Image className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <Label 
                  htmlFor="imageUpload" 
                  className="cursor-pointer text-primary hover:underline flex items-center justify-center"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Загрузить изображение
                </Label>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG или GIF, макс. 5MB
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Варианты ответов ({options.length}/6)</Label>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="multiple-choice"
                  checked={isMultipleChoice}
                  onCheckedChange={setIsMultipleChoice}
                />
                <Label htmlFor="multiple-choice">Множественный выбор</Label>
              </div>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={addOption}
                disabled={options.length >= 6}
              >
                <Plus className="h-4 w-4 mr-1" />
                Добавить
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              {options.map((option, index) => (
                <div key={option._id} className="flex items-start space-x-3 mb-4">
                  <div className="flex h-6 w-6 rounded-full border border-primary items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-grow space-y-1">
                    <Input
                      value={option.text}
                      onChange={(e) => handleOptionChange(option._id, 'text', e.target.value)}
                      placeholder={`Вариант ${option._id.toUpperCase()}`}
                      required
                    />
                  </div>
                  <div className="flex items-center h-10 space-x-2">
                    <Checkbox
                      id={`correct-${option._id}`}
                      checked={option.isCorrect}
                      onCheckedChange={(checked) => 
                        handleOptionChange(option._id, 'isCorrect', checked === true)
                      }
                    />
                    <Label htmlFor={`correct-${option._id}`} className="text-sm cursor-pointer">
                      Правильный
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(option._id)}
                      disabled={options.length <= 2}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground">
            {isMultipleChoice 
              ? "Вы можете отметить несколько вариантов как правильные" 
              : "Только один вариант может быть отмечен как правильный"}
          </p>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="explanation">Объяснение</Label>
          <Textarea
            id="explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Объясните, почему правильный ответ является верным"
            className="min-h-[100px]"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-3 py-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit">
            {questionId ? 'Обновить вопрос' : 'Добавить вопрос'}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
};

export default QuestionForm;
