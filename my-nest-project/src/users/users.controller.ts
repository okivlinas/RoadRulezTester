import { Controller, Get, Param, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/interfaces/user-role.enum';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return { success: true, data: users };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { success: true, data: user };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const user = await this.usersService.update(id, body);
    return { success: true, data: user };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { success: true, data: null };
  }
}
