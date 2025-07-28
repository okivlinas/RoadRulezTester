import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MailService } from 'src/mailSend/mailSend';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing)       throw new BadRequestException({
        message: 'Email уже используется другим пользователем',
        error: 'Email уже используется другим пользователем',
      });

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: 'student',
      createdAt: new Date()
    });

    const token = await this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new BadRequestException({
        message: 'Неверный логин или пароль',
        error: 'Неверный логин или пароль',
      });
    }
    const token = await this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

async updateProfile(userId: string, dto: UpdateProfileDto) {
  const user = await this.userModel.findById(userId);
  if (!user) throw new BadRequestException('User not found');

  let passwordChanged = false;
  let plainPassword = '';

  // Проверка на изменение email и его уникальность
  if (dto.email && dto.email !== user.email) {
    const existingUserWithEmail: any = await this.userModel.findOne({ email: dto.email });
    if (existingUserWithEmail && existingUserWithEmail._id.toString() !== userId) {
      throw new BadRequestException({
        message: 'Email уже используется другим пользователем',
        error: 'Email уже используется другим пользователем',
      });
    }
  }

  // Изменение пароля
  if (dto.password) {
    plainPassword = dto.password;
    user.password = await bcrypt.hash(dto.password, 10);
    passwordChanged = true;
  }

  // Обновляем остальные данные профиля
  user.name = dto.name ?? user.name;
  user.email = dto.email ?? user.email;

  try {
    await user.save();
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      throw new BadRequestException({
  message: 'Такой email уже существует',
  error: 'Такой email уже существует',
});
    }
    throw error;
  }

  // Отправляем email, если пароль изменён
  if (passwordChanged) {
    const mailService = new MailService();
    const message = `Ваш пароль был изменён. Новый пароль: ${plainPassword}`;
    await mailService.sendMail(message, user.email);
  }

  const token = await this.generateToken(user);
  return {
    user: this.sanitizeUser(user),
    token,
  };
}

  

  private async generateToken(user: UserDocument) {
    return this.jwtService.signAsync({
      sub: user._id,
      email: user.email,
      role: user.role,
    });
  }

  private sanitizeUser(user: UserDocument) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}