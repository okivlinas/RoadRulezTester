import {
    Injectable, NotFoundException, BadRequestException,
    HttpException,
    HttpStatus
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { CreateTestDto } from './dto/create-test.dto';
  import { UpdateTestDto } from './dto/update-test.dto';
  import { TestQueryDto } from './dto/test-query.dto';
import { Test, TestDocument } from 'src/schemas/test.schema';
import { Question, QuestionDocument } from 'src/schemas/question.schema';
  
  @Injectable()
  export class TestService {
    constructor(
      @InjectModel(Test.name) private readonly testModel: Model<TestDocument>,
      @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    ) {}
  
    async create(dto: CreateTestDto) {
      const existingTest = await this.testModel.findOne({ title: dto.title });
      if (existingTest) {
        throw new HttpException(
          {
            statusCode: 400,
            message: `Тест с названием "${dto.title}" уже существует.`,
            error: `Тест с названием "${dto.title}" уже существует.`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return this.testModel.create(dto);
    }

async update(id: string, dto: UpdateTestDto) {
  // Проверяем, если передано новое название
  if (dto.title) {
    const existingTest = await this.testModel.findOne({
      title: dto.title,
      _id: { $ne: id }, // исключаем текущий тест
    });

    if (existingTest) {
      throw new HttpException(
        {
          statusCode: 400,
          message: `Тест с названием "${dto.title}" уже существует.`,
          error: `Тест с названием "${dto.title}" уже существует.`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  const updated = await this.testModel.findByIdAndUpdate(id, dto, { new: true });
  if (!updated) throw new NotFoundException('Test not found');
  return updated;
}

  
    async findAll(query: TestQueryDto) {
      const { search, page = 1, limit = 10, mode } = query;
    
      const filter: any = {};
      if (search) {
        filter.title = { $regex: search, $options: 'i' };
      }
      if (mode) {
        filter.mode = mode;
      }
    
      const total = await this.testModel.countDocuments(filter);
    
      // Получаем тесты
      const items = await this.testModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(); // <= важно, чтобы item был обычным объектом, а не Mongoose-документом
    
      // Для каждого теста считаем кол-во вопросов
      const itemsWithQuestionCount = await Promise.all(
        items.map(async (item) => {
          const questionCount = await this.questionModel.countDocuments({ testId: item._id.toString() });

          return {
            ...item,
            questionCount,
          };
        })
      );
      return {
        total,
        page,
        limit,
        items: itemsWithQuestionCount,
      };
    }
    
  
    async findById(id: string) {
      const test = await this.testModel.findById(id);
      if (!test) throw new NotFoundException('Test not found');
      return test;
    }
  

  
      async delete(id: string) {
        const deleted = await this.testModel.findByIdAndDelete(id);
        if (!deleted) throw new NotFoundException('Test not found');

        // Удаление связанных вопросов
        await this.questionModel.deleteMany({ testId: id });

        return { success: true };
      }
  
    async uploadImage(id: string, base64: string) {
      const test = await this.testModel.findById(id);
      if (!test) throw new NotFoundException('Test not found');
      test.imageBase64 = base64;
      await test.save();
      return test;
    }
  
    async deleteImage(id: string) {
      const test = await this.testModel.findById(id);
      if (!test) throw new NotFoundException('Test not found');
      test.imageBase64 = undefined;
      await test.save();
      return test;
    }
  }
  