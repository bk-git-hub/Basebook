import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createReadStream, existsSync } from 'node:fs';
import { extname } from 'node:path';
import { IMAGE_STORAGE, type ImageStoragePort } from './storage/image-storage.port';

type UploadFileInput = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
};

@Injectable()
export class UploadService {
  constructor(@Inject(IMAGE_STORAGE) private readonly imageStorage: ImageStoragePort) {}

  async uploadImage(file?: UploadFileInput) {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    if (!file.mimeType.startsWith('image/')) {
      throw new BadRequestException('Only image uploads are supported.');
    }

    return this.imageStorage.storeImage(file);
  }

  openStoredImage(fileName: string) {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
    const resolvedPath = this.imageStorage.resolveStoredPath(sanitizedFileName);

    if (!existsSync(resolvedPath)) {
      throw new NotFoundException('Uploaded image not found.');
    }

    return {
      stream: createReadStream(resolvedPath),
      contentType: this.resolveContentType(resolvedPath),
    };
  }

  private resolveContentType(filePath: string) {
    const extension = extname(filePath).toLowerCase();

    if (extension === '.png') {
      return 'image/png';
    }

    if (extension === '.webp') {
      return 'image/webp';
    }

    if (extension === '.gif') {
      return 'image/gif';
    }

    return 'image/jpeg';
  }
}
