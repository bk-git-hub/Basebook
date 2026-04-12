import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { IMAGE_STORAGE } from './storage/image-storage.port';
import { LocalImageStorageService } from './storage/local-image-storage.service';
import { R2ImageStorageService } from './storage/r2-image-storage.service';
import { getUploadStorageConfig } from './storage/upload-storage.config';

@Module({
  controllers: [UploadController],
  providers: [
    UploadService,
    LocalImageStorageService,
    R2ImageStorageService,
    {
      provide: IMAGE_STORAGE,
      useFactory: (
        localImageStorage: LocalImageStorageService,
        r2ImageStorage: R2ImageStorageService,
      ) => {
        const config = getUploadStorageConfig();

        if (config.driver === 'r2') {
          return r2ImageStorage;
        }

        if (config.driver === 'auto' && config.r2.configured) {
          return r2ImageStorage;
        }

        return localImageStorage;
      },
      inject: [LocalImageStorageService, R2ImageStorageService],
    },
  ],
})
export class UploadModule {}
