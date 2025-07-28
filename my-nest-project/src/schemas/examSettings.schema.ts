import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExamSettingsDocument = ExamSettings & Document;

@Schema({ timestamps: true })
export class ExamSettings {
  @Prop({ required: true })
  timeLimit: string;

  @Prop()
  questionCount: string;

  @Prop({ required: true, default: 0 })
  attemptsAllowed: number;
}

export const ExamSettingsSchema = SchemaFactory.createForClass(ExamSettings);
