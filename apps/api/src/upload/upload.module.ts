import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { IMAGE_STORAGE } from './storage/image-storage.port';
import { LocalImageStorageService } from './storage/local-image-storage.service';

@Module({
  controllers: [UploadController],
  providers: [
    UploadService,
    LocalImageStorageService,
    {
      provide: IMAGE_STORAGE,
      useExisting: LocalImageStorageService,
    },
  ],
})
export class UploadModule {}
