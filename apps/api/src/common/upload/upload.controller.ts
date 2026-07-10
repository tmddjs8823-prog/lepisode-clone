import {
  Controller,
  Post,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('api/v1/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * POST /api/v1/upload?folder=blog
   * multipart/form-data 로 file 필드에 이미지 전송
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (_req, file, cb) => {
        const allowed = /^image\/(jpeg|png|gif|webp|svg\+xml|avif)$/;
        if (!allowed.test(file.mimetype)) {
          return cb(
            new BadRequestException(
              '지원하지 않는 파일 형식입니다. (jpeg, png, gif, webp, svg, avif)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: MulterFile,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('파일이 전송되지 않았습니다.');
    }

    const result = await this.uploadService.upload(file, folder || 'general');
    return result;
  }

  /**
   * DELETE /api/v1/upload?path=blog/uuid.png
   */
  @Delete()
  @HttpCode(204)
  async remove(@Query('path') filePath: string) {
    if (!filePath) {
      throw new BadRequestException('삭제할 파일 경로가 필요합니다.');
    }
    await this.uploadService.remove(filePath);
  }
}
