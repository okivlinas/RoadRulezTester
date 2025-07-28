import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestController } from './tests.controller';
import { TestService } from './tests.service';
import { Test, TestSchema } from 'src/schemas/test.schema';
import { Question, QuestionSchema } from 'src/schemas/question.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Test.name, schema: TestSchema }, { name: Question.name, schema: QuestionSchema }])],
  providers: [TestService],
  controllers: [TestController],
  exports: [TestService],
})
export class TestModule {}
