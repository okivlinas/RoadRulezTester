export class UpdateQuestionDto {
    text?: string;
    imageUrl?: string;
    imageBase64?: string;
    options?: { text: string; isCorrect: boolean }[];
    explanation?: string;
    testId?: string;
    isMultipleChoice?: boolean;
  }