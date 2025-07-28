import {
    Controller,
    Post,
    Delete,
    Param,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { UploadService } from './upload.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

  
  @Controller('api/upload/image')
  @UseGuards(JwtAuthGuard)
  export class UploadController {
    constructor(private readonly uploadService: UploadService) {}
  
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
      if (!file) {
        throw new HttpException('Файл не загружен', HttpStatus.BAD_REQUEST);
      }
  
      const result = this.uploadService.getImageResponse(file);
      return { success: true, data: result };
    }
  
    @Delete(':fileName')
    async deleteImage(@Param('fileName') fileName: string) {
      await this.uploadService.deleteImage(fileName);
      return { success: true, data: null };
    }
  }
  