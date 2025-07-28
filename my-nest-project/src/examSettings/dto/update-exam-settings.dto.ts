import { PartialType } from '@nestjs/mapped-types';
import { CreateExamSettingsDto } from './create-exam-settings.dto';

export class UpdateExamSettingsDto extends PartialType(CreateExamSettingsDto) {}
