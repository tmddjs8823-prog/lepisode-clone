import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as path from 'path';

interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private supabase: SupabaseClient;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_KEY'),
    );
    this.bucket = this.config.get<string>('SUPABASE_BUCKET') || 'lepisode-uploads';
    this.logger.log(`Supabase Storage bucket: ${this.bucket}`);
  }

  async upload(
    file: UploadedFile,
    folder = 'general',
  ): Promise<{ url: string; path: string }> {
    const ext = path.extname(file.originalname) || '.bin';
    const fileName = `${folder}/${randomUUID()}${ext}`;

    this.logger.log(`Uploading ${file.originalname} (${file.size} bytes) → ${this.bucket}/${fileName}`);

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Supabase upload failed: ${error.message}`, error);
      throw new BadRequestException(`파일 업로드 실패: ${error.message}`);
    }

    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(fileName);

    this.logger.log(`Upload success: ${data.publicUrl}`);
    return { url: data.publicUrl, path: fileName };
  }

  /**
   * Supabase Storage에서 파일을 삭제합니다.
   * @param filePath - 저장 경로 (예: 'blog/uuid.png')
   */
  async remove(filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }
  }
}
