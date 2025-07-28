
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Question, Test } from '@/types';

interface QuestionViewDialogProps {
  question: Question | null;
  tests: Test[];
  isOpen: boolean;
  onClose: () => void;
}

const QuestionViewDialog: React.FC<QuestionViewDialogProps> = ({
  question,
  tests,
  isOpen,
  onClose
}) => {
  const getTestTitle = (testId?: string) => {
    if (!testId) return 'Не привязан к теме';
    const test = tests.find(t => t._id === testId);
    return test ? test.title : 'Неизвестная тема';
  };

  if (!question) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="break-words">Детали вопроса</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-x-hidden break-words whitespace-pre-wrap">
          <div>
            <h3 className="font-semibold mb-1">Вопрос:</h3>
            <p className="break-all whitespace-pre-wrap">{question.text}</p>
          </div>

          {question.testId && (
            <div>
              <h3 className="font-semibold mb-1">Тест/Тема:</h3>
              <p className="break-all">{getTestTitle(question.testId)}</p>
            </div>
          )}

          {question.imageBase64 && (
            <div>
              <h3 className="font-semibold mb-1">Изображение:</h3>
              <div className="max-h-[300px] overflow-hidden rounded-md border">
                <img
                  src={question.imageBase64}
                  alt="Question"
                  className="max-w-full h-auto mx-auto"
                />
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-1">Варианты ответов:</h3>
            <div className="space-y-2">
              {question.options.map((option, i) => (
                <div
                  key={option._id}
                  className={`p-2 rounded-md ${
                    option.isCorrect ? 'bg-green-50 border border-green-200' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                        option.isCorrect ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                      }`}
                    >
                      {++i}
                    </div>
                    <div className="flex-grow break-all whitespace-pre-wrap">
                      {option.text}
                      {option.isCorrect && (
                        <span className="ml-2 text-green-600 text-sm">
                          (Правильный ответ)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Объяснение:</h3>
            <p className="break-all whitespace-pre-wrap">{question.explanation}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionViewDialog;
