import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Req
  } from '@nestjs/common';
  import { AdminService } from './admin.service';

  import { Request } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
  
  @Controller('api/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  export class AdminController {
    constructor(private readonly adminService: AdminService) {}
  
    @Get('users')
    async getUsers(
      @Query('search') search?: string,
      @Query('role') role?: string,
      @Query('page') page = '1',
      @Query('limit') limit = '10'
    ) {
      const result = await this.adminService.getUsers(search, role, +page, +limit);
      return { success: true, data: result };
    }
  
    @Get('users/:id')
    async getUser(@Param('id') id: string) {
      const user = await this.adminService.getUser(id);
      return { success: true, data: user };
    }
  
    @Post('users')
    async createUser(@Body() dto: CreateUserDto) {
      const user = await this.adminService.createUser(dto);
      return { success: true, data: user };
    }
  
    @Put('users/:id')
    async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
      const user = await this.adminService.updateUser(id, dto);
      return { success: true, data: user };
    }
  
    @Delete('users/:id')
    async deleteUser(@Param('id') id: string) {
      await this.adminService.deleteUser(id);
      return { success: true, data: null };
    }
  
    @Get('results/stats')
    async getOverallStats() {
      const stats = await this.adminService.getOverallStats();
      return { success: true, data: stats };
    }
  }