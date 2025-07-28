// questions.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Question, QuestionDocument } from 'src/schemas/question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Test, TestDocument } from 'src/schemas/test.schema';

@Injectable()
export class QuestionsService {
  constructor(@InjectModel(Question.name) private questionModel: Model<QuestionDocument>, 
              @InjectModel(Test.name) private readonly testModel: Model<TestDocument>) {}

  // Получение списка вопросов
  async getQuestions(query: any) {
    const { testId, search, page, limit } = query;
    const filters: any = {};

    if (testId) filters.testId = testId;
    if (search) filters.text = { $regex: search, $options: 'i' };

    const questions = await this.questionModel
      .find(filters)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const totalCount = await this.questionModel.countDocuments(filters);

    return { questions, totalCount };
  }

  async getQuestionById(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Некорректный ID');
    }
  
    const question = await this.questionModel.findById(id).exec();
  
    if (!question) {
      throw new NotFoundException('Вопрос не найден');
    }
  
    return question;
  }
  
  // Получение вопросов для теста
  async getTestQuestions(testId: string, count: number) {
    return await this.questionModel
      .find({ testId })
      .limit(count)
      .exec();
  }

  // Получение случайных вопросов
async getRandomQuestions(count: number) {
  const topics: QuestionDocument[] = await this.questionModel.aggregate([
    { $match: { testId: { $ne: null } } },
    { $group: { _id: '$topicId' } },
  ]);

  const topicIds = topics.map(t => t._id);
  const topicCount = topicIds.length;

  // Если вопросов меньше, чем тем — выбираем случайные темы
  const effectiveTopics =
    count < topicCount
      ? topicIds.sort(() => 0.5 - Math.random()).slice(0, count)
      : topicIds;

  const questionsPerTopic = Math.floor(count / effectiveTopics.length);
  const remaining = count % effectiveTopics.length;

  const questions: QuestionDocument[] =  [];

  for (let i = 0; i < effectiveTopics.length; i++) {
    const topicId = effectiveTopics[i];
    const extra = i < remaining ? 1 : 0;

    const topicQuestions: QuestionDocument[] = await this.questionModel
      .aggregate([
        { $match: { topicId } },
        { $sample: { size: questionsPerTopic + extra } },
      ]);

    questions.push(...topicQuestions);
  }

  // Если тем мало и вопросов меньше, чем count — добираем случайные
  if (questions.length < count) {
    const additional = await this.questionModel.aggregate([
      { $match: { _id: { $nin: questions.map(q => q._id) } } },
      { $sample: { size: count - questions.length } },
    ]);
    questions.push(...additional);
  }

  // Перемешиваем финальный список
  return questions.sort(() => 0.5 - Math.random());
}

  // Создание нового вопроса
async createQuestion(createQuestionDto: CreateQuestionDto) {
  // Убираем _id из вариантов и подготавливаем их
  createQuestionDto.options = createQuestionDto.options.map((item) => ({
    text: item.text,
    isCorrect: item.isCorrect,
  }));

  // Автоматически определяем isMultipleChoice
  const correctAnswersCount = createQuestionDto.options.filter(opt => opt.isCorrect).length;
  createQuestionDto.isMultipleChoice = correctAnswersCount > 1;


  const question = new this.questionModel(createQuestionDto);
  return await question.save();
}

  // Обновление существующего вопроса
async updateQuestion(id: string, updateQuestionDto: UpdateQuestionDto) {
  const existing = await this.questionModel.findById(id);
  if (!existing) throw new NotFoundException('Question not found');

  // Обновляем простые поля
  if (updateQuestionDto.text) existing.text = updateQuestionDto.text;
  if (updateQuestionDto.explanation) existing.explanation = updateQuestionDto.explanation;
  if (updateQuestionDto.testId) existing.testId = Object(updateQuestionDto.testId);

  // Обработка изображения
  if (updateQuestionDto.imageUrl === '' || updateQuestionDto.imageUrl === undefined) {
    existing.imageUrl = '';
    existing.imageBase64 = '';
  } else {
    if (updateQuestionDto.imageUrl !== undefined) {
      existing.imageUrl = updateQuestionDto.imageUrl;
    }
    if (updateQuestionDto.imageBase64 !== undefined) {
      existing.imageBase64 = updateQuestionDto.imageBase64;
    }
  }

  if (updateQuestionDto.imageBase64) {
    existing.imageBase64 = updateQuestionDto.imageBase64;
  }

  // Обновляем варианты ответов
  if (Array.isArray(updateQuestionDto.options)) {
    existing.options = updateQuestionDto.options.map(opt => ({
      text: opt.text,
      isCorrect: opt.isCorrect,
    }));

    // Автоматическое определение isMultipleChoice
    const correctCount = existing.options.filter(opt => opt.isCorrect).length;
    existing.isMultipleChoice = correctCount > 1;
  } else if (updateQuestionDto.isMultipleChoice !== undefined) {
    // Обновляем вручную, если не обновлялись options
    existing.isMultipleChoice = updateQuestionDto.isMultipleChoice;
  }

  return await existing.save();
}



  // Удаление вопроса
  async deleteQuestion(id: string) {
    return await this.questionModel.findByIdAndDelete(id).exec();
  }

  // Загрузка изображения для вопроса
  async uploadImage(file: Express.Multer.File) {
    // Сохраняем файл, возвращаем URL
    return `/uploads/${file.filename}`;
  }
}
