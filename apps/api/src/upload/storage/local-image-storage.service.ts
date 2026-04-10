import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ImageStoragePort, StoredImageAsset, UploadableImage } from './image-storage.port';

const LOCAL_UPLOADS_DIR = resolve(__dirname, '..', '..', '..', 'private', 'uploads');

@Injectable()
export class LocalImageStorageService implements ImageStoragePort {
  storeImage(file: UploadableImage): Promise<StoredImageAsset> {
    this.ensureUploadsDir();

    const id = randomUUID();
    const safeExtension = this.getSafeExtension(file.originalName, file.mimeType);
    const fileName = `${id}${safeExtension}`;
    const outputPath = resolve(LOCAL_UPLOADS_DIR, fileName);

    writeFileSync(outputPath, file.buffer);

    return Promise.resolve({
      id,
      fileName,
      urlPath: `/uploads/local/${fileName}`,
    });
  }

  resolveStoredPath(fileName: string) {
    return resolve(LOCAL_UPLOADS_DIR, fileName);
  }

  private ensureUploadsDir() {
    if (!existsSync(LOCAL_UPLOADS_DIR)) {
      mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
    }
  }

  private getSafeExtension(originalName: string, mimeType: string) {
    const originalExtension = extname(originalName).toLowerCase();

    if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(originalExtension)) {
      return originalExtension;
    }

    if (mimeType === 'image/png') {
      return '.png';
    }

    if (mimeType === 'image/webp') {
      return '.webp';
    }

    if (mimeType === 'image/gif') {
      return '.gif';
    }

    return '.jpg';
  }
}
