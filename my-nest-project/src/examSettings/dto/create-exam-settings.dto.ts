import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateExamSettingsDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  questionCount: number;

  @IsEnum(['practice', 'thematic', 'exam'])
  mode: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageBase64?: string;
}
