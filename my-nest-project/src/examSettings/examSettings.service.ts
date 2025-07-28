// results.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExamSettings, ExamSettingsDocument } from 'src/schemas/examSettings.schema';
import { TestResult, TestResultDocument } from 'src/schemas/test-result.schema';
import { CreateExamSettingsDto } from './dto/create-exam-settings.dto';
import { UpdateExamSettingsDto } from './dto/update-exam-settings.dto';


@Injectable()
export class ExamSettingsService {
  constructor(@InjectModel(ExamSettings.name) private examSettingsModel: Model<ExamSettingsDocument>) {}

  async getSettings(): Promise<ExamSettings> {
    const settings = await this.examSettingsModel.findOne();
    if (!settings) {
      throw new NotFoundException('Настройки не найдены');
    }
    return settings;
  }

  async createSettings(dto: CreateExamSettingsDto): Promise<ExamSettings> {
    const existing = await this.examSettingsModel.findOne();
    if (existing) {
      throw new Error('Настройки уже существуют');
    }
    return this.examSettingsModel.create(dto);
  }

  async updateSettings(dto: UpdateExamSettingsDto): Promise<ExamSettings> {
    const settings = await this.examSettingsModel.findOne();
    if (!settings) {
      throw new NotFoundException('Настройки не найдены');
    }
    console.log(dto);
    Object.assign(settings, dto);
    return settings.save();
  }
}