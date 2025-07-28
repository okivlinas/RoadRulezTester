export class CreateQuestionDto {
    text: string;
    imageUrl?: string;
    imageBase64?: string;
    options: { text: string; isCorrect: boolean }[];
    explanation: string;
    topicId?: string;
    testId?: string;
    isMultipleChoice?: boolean;
  }