import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailService } from 'src/mailSend/mailSend';
import { User, UserDocument } from 'src/schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll() {
    return this.userModel.find().select('-password').exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

async update(id: string, update: any) {
  const existingUser = await this.userModel.findById(id);
  console.log(update);
  if (!existingUser) throw new NotFoundException('User not found');

  // Проверка на уникальность email
  if (update.email && update.email !== existingUser.email) {
    const userWithEmail: any = await this.userModel.findOne({ email: update.email });
    if (userWithEmail && userWithEmail._id.toString() !== id) {
      throw new BadRequestException('Email уже используется другим пользователем');
    }
  }

  // Хеширование пароля и уведомление
  if (update.password) {
    const plainPassword = update.password; 
    update.password = await bcrypt.hash(update.password, 10);
    const mailService = new MailService();
    const message = `Ваш пароль был изменён. Новый пароль: ${plainPassword}`;
    await mailService.sendMail(message, existingUser.email);
  }

  try {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, update, { new: true })
      .select('-password');
    return updatedUser;
  } catch (error) {
    if (error.code === 11000) {
      throw new BadRequestException('Такой email уже используется');
    }
    throw error;
  }
}

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found');
    return;
  }
}
