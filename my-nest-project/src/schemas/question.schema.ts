import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Option {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  isCorrect: boolean;
}

export const OptionSchema = SchemaFactory.createForClass(Option);

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true })
  text: string;

  @Prop()
  imageUrl: string;

  @Prop()
  imageBase64: string;

  @Prop({ required: true })
  explanation: string;

  @Prop({ required: false, default: false })
  isMultipleChoice: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Test', required: true })
  testId: Types.ObjectId;

  @Prop({ type: [OptionSchema], default: [] })
  options: Option[];

  
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
