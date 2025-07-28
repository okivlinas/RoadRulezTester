// results.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateResultDto } from './dto/create-result.dto';
import { TestResult, TestResultDocument } from 'src/schemas/test-result.schema';


@Injectable()
export class ResultsService {
  constructor(@InjectModel(TestResult.name) private resultModel: Model<TestResultDocument>) {}

  async create(userId: string, dto) {
    try {
    const result = await this.resultModel.create({
      ...dto,
      userId: userId,
      createdAt: new Date(),
    });
    return result;
    }
    catch(e) {
      console.error(e);
    }
  }

  async findAllByUser(userId: string) {
    return this.resultModel.find({ user: userId }).populate('test').exec();
  }

  async getLatestResult(userId: string, mode?: string) {
    const filter: any = { userId };
    if (mode) {
      filter.testMode = mode;
    }
  
    const result = await this.resultModel
      .findOne(filter)
      .sort({ createdAt: -1 })
      .lean();
  
    if (!result) return null;
  
    return {
      ...result,
      _id: result._id.toString(),
      userId: result.userId.toString(),
      answers: result.answers.map((a) => ({
        questionId: a.questionId.toString(),
        selectedOptionId: a.selectedOptionId.toString(),
        isCorrect: a.isCorrect,
      })),
    };
  }
  

  async findOne(userId: string, id: string) {
    console.log(userId)
    console.log(id)
    const result = await this.resultModel.findById(id).populate('test').exec();
    if (!result) throw new NotFoundException('Result not found');
    if (result.userId.toString() !== userId) throw new ForbiddenException();
    return result;
  }
  
  async getUserStats(userId: string, mode: string, startDate?: string, endDate?: string) {
    const match: any = { userId: userId }; // <-- тут поправил
    if (mode !== 'all') match.testMode = mode;
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }
  
    const stats = await this.resultModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          averageScore: { $avg: '$score' },
          correctAnswerPercentage: {
            $avg: {
              $multiply: [ { $divide: ['$correctAnswers', '$totalQuestions'] }, 100 ]
            }
          },
          testsPassed: {
            $sum: { $cond: ['$passed', 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalTests: 1,
          averageScore: { $round: ['$averageScore', 1] },
          correctAnswerPercentage: { $round: ['$correctAnswerPercentage', 1] },
          testsPassed: 1
        }
      }
    ]);
  
    return stats[0] || {
      totalTests: 0,
      averageScore: 0,
      correctAnswerPercentage: 0,
      testsPassed: 0
    };
  }
  
}