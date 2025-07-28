import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Req,
    UseGuards,
    Query,
    Put,
    Patch
  } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ExamSettingsService } from './examSettings.service';
import { CreateExamSettingsDto } from './dto/create-exam-settings.dto';
import { UpdateExamSettingsDto } from './dto/update-exam-settings.dto';

  
  @Controller('api/setting')
  export class ExamSettingsController {
    constructor(private readonly examSettingsService: ExamSettingsService) {}
  

    @UseGuards(JwtAuthGuard)
    @Patch("/update")
    updateSettings(@Body() dto: any) {
      console.log("132123123123");
      return this.examSettingsService.updateSettings(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getSettings() {
      return this.examSettingsService.getSettings();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    createSettings(@Body() dto: CreateExamSettingsDto) {
            console.log("dwfwf");
      return this.examSettingsService.createSettings(dto);
    }


    
  }