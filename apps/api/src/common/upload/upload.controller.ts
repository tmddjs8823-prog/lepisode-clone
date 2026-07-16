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
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { UploadService } from './upload.service';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('Upload')
@Controller('api/v1/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * POST /api/v1/upload?folder=blog
   * multipart/form-data 로 file 필드에 이미지 전송
   */
  @ApiOperation({ summary: '파일 업로드 (이미지·문서)' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', required: false, example: 'blog' })
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (_req, file, cb) => {
        const allowedMime =
          /^(image\/(jpeg|png|gif|webp|svg\+xml|avif)|application\/(pdf|vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml\.presentation|haansofthwp|x-hwp|vnd\.hancom\.hwp|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|octet-stream))$/;
        const allowedExt = /\.(jpe?g|png|gif|webp|svg|avif|pdf|pptx?|hwp|docx?|xlsx?)$/i;
        if (allowedMime.test(file.mimetype) || allowedExt.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              '지원하지 않는 파일 형식입니다. (이미지: jpeg, png, gif, webp, svg, avif / 문서: pdf, ppt, pptx, hwp, doc, docx, xls, xlsx)',
            ),
            false,
          );
        }
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
  @ApiOperation({ summary: '업로드 파일 삭제' })
  @ApiQuery({ name: 'path', required: true, description: '삭제할 파일 경로' })
  @Delete()
  @HttpCode(204)
  async remove(@Query('path') filePath: string) {
    if (!filePath) {
      throw new BadRequestException('삭제할 파일 경로가 필요합니다.');
    }
    await this.uploadService.remove(filePath);
  }
}

