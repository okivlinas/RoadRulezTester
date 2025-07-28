import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';
import { TestResult, TestResultSchema } from 'src/schemas/test-result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TestResult.name, schema: TestResultSchema }]),
  ],
  controllers: [ResultsController],
  providers: [ResultsService],
})
export class ResultsModule {}