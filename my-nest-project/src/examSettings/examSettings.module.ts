import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamSettings, ExamSettingsSchema } from 'src/schemas/examSettings.schema';
import { TestResult, TestResultSchema } from 'src/schemas/test-result.schema';
import { ExamSettingsController } from './examSettings.controller';
import { ExamSettingsService } from './examSettings.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ExamSettings.name, schema: ExamSettingsSchema }]),
  ],
  controllers: [ExamSettingsController],
  providers: [ExamSettingsService],
})
export class ExamSettingsModule {}