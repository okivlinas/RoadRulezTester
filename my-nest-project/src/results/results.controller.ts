import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Req,
    UseGuards,
    Query
  } from '@nestjs/common';
  import { ResultsService } from './results.service';
  import { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateResultDto } from './dto/create-result.dto';
  
  @Controller('/results')
  export class ResultsController {
    constructor(private readonly resultsService: ResultsService) {}


    @Get('/latest')
    @UseGuards(JwtAuthGuard)
    async getLatest(
      @Req() req,
      @Query('mode') mode: 'exam' | 'practice' | 'thematic' // можно расширить enum при необходимости
    ) {
      return await this.resultsService.getLatestResult(req.user._id, mode);
    }
    

  
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Req() req: Request, @Body() dto: CreateResultDto) {
      const userId = req.user['_id'];
      const result = await this.resultsService.create(userId, dto);
      return { success: true, data: result };
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats')
    async getStats(
      @Req() req: Request,
      @Query('mode') mode = 'all',
      @Query('startDate') startDate?: string,
      @Query('endDate') endDate?: string
    ) {
      const userId = req.user['_id'];
      const stats = await this.resultsService.getUserStats(userId, mode, startDate, endDate);
      return { success: true, data: stats };
    }
  
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllByUser(@Req() req: Request) {
      const userId = req.user['_id'];
      const results = await this.resultsService.findAllByUser(userId);
      return { success: true, data: results };
    }
  
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Req() req: Request, @Param('id') id: string) {
      const userId = req.user['_id'];
      const result = await this.resultsService.findOne(userId, id);
      return { success: true, data: result };
    }


    
  }