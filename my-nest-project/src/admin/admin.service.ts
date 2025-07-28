import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TestResult, TestResultDocument } from 'src/schemas/test-result.schema';

@Injectable()
export class AdminService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, 
              @InjectModel(TestResult.name) private testResultModel: Model<TestResultDocument>) {}

  async getUsers(search?: string, role?: string, page = 1, limit = 10) {
    const query: any = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }
    if (role) query.role = role;

    const [users, totalCount] = await Promise.all([
      this.userModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .select('name email role'),
      this.userModel.countDocuments(query),
    ]);

    return { users, totalCount };
  }

  async getUser(id: string) {
    const user = await this.userModel.findById(id).select('name email role');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

async createUser(dto: CreateUserDto) {
  const existingUser = await this.userModel.findOne({ email: dto.email });
  if (existingUser) {
throw new HttpException(
  {
    statusCode: 409,
    message: 'Пользователь с таким email уже существует',
    error: 'Пользователь с таким email уже существует',
  },
  HttpStatus.CONFLICT,
);
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);
  const user = new this.userModel({ ...dto, password: hashedPassword });
  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async updateUser(id: string, dto: UpdateUserDto) {
  const updateData: any = {
    name: dto.name,
    email: dto.email,
    role: dto.role,
  };

  // Проверка email, если он передан и отличается от текущего
  if (dto.email) {
    const existingUser: any = await this.userModel.findOne({ email: dto.email });
    if (existingUser && existingUser._id.toString() !== id) {
throw new HttpException(
  {
    statusCode: 409,
    message: 'Пользователь с таким email уже существует',
    error: 'Пользователь с таким email уже существует',
  },
  HttpStatus.CONFLICT,
);  
    }
  }

  if (dto.password) {
    updateData.password = await bcrypt.hash(dto.password, 10);
  }

  const user = await this.userModel
    .findByIdAndUpdate(id, updateData, { new: true })
    .select('name email role');

  if (!user) throw new NotFoundException('Пользователь не найден');

  return user;
}

  async deleteUser(id: string) {
    await this.userModel.findByIdAndDelete(id);
  }

  async getOverallStats(testMode?: 'practice' | 'thematic' | 'exam') {
    const filter = testMode ? { testMode } : {};
  
    const results = await this.testResultModel.find(filter);
  
    const totalTests = results.length;
  
    const averageScore =
      totalTests > 0
        ? results.reduce((sum, r) => sum + r.score, 0) / totalTests
        : 0;
  
    const passedCount = results.filter(r => r.passed).length;
  
    const passRate = totalTests > 0 ? (passedCount / totalTests) * 100 : 0;
  
    return {
      totalTests,
      averageScore: +averageScore.toFixed(2),
      passRate: +passRate.toFixed(2),
    };
  }
  
  
}
