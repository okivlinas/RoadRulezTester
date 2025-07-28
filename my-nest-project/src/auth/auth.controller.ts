// auth.controller.ts (NestJS + JWT)
import {
  Body, Controller, Get, Post, Put, Req, UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return { success: true, data };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return { success: true, data };
  }

  @Post('logout')
  async logout() {
    return { success: true, data: null };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: Request) {
    const user = req.user;
    return { success: true, data: user };
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    const updated = await this.authService.updateProfile(req.user['_id'], dto);
    return { success: true, data: updated };
  }

  @Get('health')
  async health(@Req() req: Request) {
    return { success: true };
  }
  
}
