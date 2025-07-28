import {
    Body, Controller, Delete, Get, Param, Post, Put, Query
  } from '@nestjs/common';

  import { CreateTestDto } from './dto/create-test.dto';
  import { UpdateTestDto } from './dto/update-test.dto';
  import { TestQueryDto } from './dto/test-query.dto';
  import { TestService } from './tests.service';
  
  @Controller('api/tests')
  export class TestController {
    constructor(private readonly testService: TestService) {}
  
    @Post()
    create(@Body() dto: CreateTestDto) {
      return this.testService.create(dto);
    } 
  
    @Get()
    findAll(@Query() query: TestQueryDto) {
      return this.testService.findAll(query);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.testService.findById(id);
    }
  
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTestDto) {
      return this.testService.update(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.testService.delete(id);
    }
  
    @Post(':id/upload-image')
    uploadImage(@Param('id') id: string, @Body('base64') base64: string) {
      return this.testService.uploadImage(id, base64);
    }
  
    @Post(':id/delete-image')
    deleteImage(@Param('id') id: string) {
      return this.testService.deleteImage(id);
    }
  }
  