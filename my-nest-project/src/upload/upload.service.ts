import { Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadService {
  getImageResponse(file: Express.Multer.File) {
    return {
      url: `/uploads/images/${file.filename}`,
      path: `uploads/images/${file.filename}`,
      fileName: file.filename,
    };
  }

  async deleteImage(fileName: string) {
    const filePath = join(process.cwd(), 'uploads/images', fileName);
    try {
      await unlink(filePath);
    } catch {
      throw new NotFoundException('Файл не найден');
    }
  }
}
