export class CreateTestDto {
    title: string;
    description?: string;
    questionCount?: number;
    mode: 'practice' | 'thematic' | 'exam';
    imageUrl?: string;
    imageBase64?: string;
  }