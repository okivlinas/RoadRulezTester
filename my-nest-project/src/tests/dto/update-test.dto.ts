export class UpdateTestDto {
    title?: string;
    description?: string;
    questionCount?: number;
    mode?: 'practice' | 'thematic' | 'exam';
    imageBase64?: string;
  }