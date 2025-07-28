// questions.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';

import { QuestionsService } from './questions.service';

import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller('api/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // Получение списка вопросов
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getQuestions(
    @Query('testId') testId: string,
    @Query('search') search: string, 
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const questions = await this.questionsService.getQuestions({ testId, search, page, limit });
    return { success: true, data: questions };
  }

  @Get('random')
  async getRandomQuestions(@Query('count') count: number = 5) {
    const questions = await this.questionsService.getRandomQuestions(count);
    return { success: true, data: questions };
  }
  // Получение вопроса по ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getQuestion(@Param('id') id: string, @Req() req) {
    const question = await this.questionsService.getQuestionById(id);
    return { success: true, data: question };
  }

  // Получение вопросов для теста
  @UseGuards(JwtAuthGuard)
  @Get('test/:testId')
  async getTestQuestions(
    @Param('testId') testId: string,
    @Query('count') count: number = 5
  ) {
    console.log(testId);
    const questions = await this.questionsService.getTestQuestions(testId, count);
    return { success: true, data: questions };
  }

  // Получение случайных вопросов для практики
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    const question = await this.questionsService.createQuestion(createQuestionDto);
    return { success: true, data: question };
  }

  // Обновление существующего вопроса
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  async updateQuestion(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    const updatedQuestion = await this.questionsService.updateQuestion(id, updateQuestionDto);
    return { success: true, data: updatedQuestion };
  }

  // Удаление вопроса
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async deleteQuestion(@Param('id') id: string) {
    await this.questionsService.deleteQuestion(id);
    return { success: true, data: null };
  }

  // Загрузка изображения для вопроса
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.questionsService.uploadImage(file);
    return { success: true, data: { url: imageUrl } };
  }
}
