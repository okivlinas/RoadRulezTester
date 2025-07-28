import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TestResultDocument = TestResult & Document;

class Answer {
  @Prop({ type: Types.ObjectId, required: true })
  questionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  selectedOptionId: Types.ObjectId;

  @Prop({ required: true })
  isCorrect: boolean;
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class TestResult {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['practice', 'thematic', 'exam'] })
  testMode: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  totalQuestions: number;

  @Prop({ required: true })
  correctAnswers: number;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  passed: boolean;

  @Prop({ required: true })
  timeSpent: number;

  @Prop({ type: [Answer], default: [] })
  answers: Answer[];
}

export const TestResultSchema = SchemaFactory.createForClass(TestResult);
