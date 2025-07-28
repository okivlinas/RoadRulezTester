import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TestDocument = Test & Document;

@Schema({ timestamps: true })
export class Test {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, default: 0 })
  questionCount: number;

  @Prop({ required: true, enum: ['practice', 'thematic', 'exam'] })
  mode: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  imageBase64?: string;
}

export const TestSchema = SchemaFactory.createForClass(Test);
