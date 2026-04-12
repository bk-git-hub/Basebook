import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import type {
  ImageStoragePort,
  StoredImageAsset,
  UploadableImage,
} from './image-storage.port';
import { getUploadStorageConfig } from './upload-storage.config';

const R2_REGION = 'auto';
const R2_SERVICE = 's3';
const UNSIGNED_PAYLOAD_HEADER = 'x-amz-content-sha256';

@Injectable()
export class R2ImageStorageService implements ImageStoragePort {
  async storeImage(file: UploadableImage): Promise<StoredImageAsset> {
    const config = getUploadStorageConfig().r2;

    if (!config.configured) {
      throw new ServiceUnavailableException(
        'R2 image storage is not configured.',
      );
    }

    const id = randomUUID();
    const extension = this.getSafeExtension(file.originalName, file.mimeType);
    const objectKey = `uploads/${this.formatDatePrefix(new Date())}/${id}${extension}`;
    const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;
    const encodedObjectKey = this.encodeObjectKey(objectKey);
    const path = `/${config.bucket}/${encodedObjectKey}`;
    const url = `${endpoint}${path}`;
    const payloadHash = this.sha256(file.buffer);
    const signedHeaders = this.signRequest({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      host: new URL(endpoint).host,
      path,
      payloadHash,
      contentType: file.mimeType,
    });

    const response = await fetch(url, {
      method: 'PUT',
      headers: signedHeaders,
      body: file.buffer as unknown as BodyInit,
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `R2 image upload failed with HTTP ${response.status}.`,
      );
    }

    return {
      id,
      fileName: objectKey,
      url: `${config.publicBaseUrl}/${this.encodePublicPath(objectKey)}`,
    };
  }

  resolveStoredPath(): string {
    throw new ServiceUnavailableException(
      'R2 images are served from their public URL.',
    );
  }

  private signRequest(input: {
    accessKeyId: string;
    secretAccessKey: string;
    host: string;
    path: string;
    payloadHash: string;
    contentType: string;
  }) {
    const now = new Date();
    const amzDate = this.formatAmzDate(now);
    const dateStamp = amzDate.slice(0, 8);
    const credentialScope = `${dateStamp}/${R2_REGION}/${R2_SERVICE}/aws4_request`;
    const canonicalHeaders =
      `content-type:${input.contentType}\n` +
      `host:${input.host}\n` +
      `${UNSIGNED_PAYLOAD_HEADER}:${input.payloadHash}\n` +
      `x-amz-date:${amzDate}\n`;
    const signedHeaders = `content-type;host;${UNSIGNED_PAYLOAD_HEADER};x-amz-date`;
    const canonicalRequest = [
      'PUT',
      input.path,
      '',
      canonicalHeaders,
      signedHeaders,
      input.payloadHash,
    ].join('\n');
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      this.sha256(canonicalRequest),
    ].join('\n');
    const signingKey = this.getSigningKey(input.secretAccessKey, dateStamp);
    const signature = createHmac('sha256', signingKey)
      .update(stringToSign)
      .digest('hex');

    return {
      Authorization: `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      'Content-Type': input.contentType,
      Host: input.host,
      [UNSIGNED_PAYLOAD_HEADER]: input.payloadHash,
      'x-amz-date': amzDate,
    };
  }

  private getSigningKey(secretAccessKey: string, dateStamp: string) {
    const dateKey = createHmac('sha256', `AWS4${secretAccessKey}`)
      .update(dateStamp)
      .digest();
    const regionKey = createHmac('sha256', dateKey).update(R2_REGION).digest();
    const serviceKey = createHmac('sha256', regionKey)
      .update(R2_SERVICE)
      .digest();
    return createHmac('sha256', serviceKey).update('aws4_request').digest();
  }

  private sha256(value: Buffer | string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private formatAmzDate(date: Date) {
    return date.toISOString().replace(/[:-]|\.\d{3}/gu, '');
  }

  private formatDatePrefix(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  private encodeObjectKey(objectKey: string) {
    return objectKey.split('/').map(encodeURIComponent).join('/');
  }

  private encodePublicPath(objectKey: string) {
    return objectKey.split('/').map(encodeURIComponent).join('/');
  }

  private getSafeExtension(originalName: string, mimeType: string) {
    const originalExtension = extname(originalName).toLowerCase();

    if (
      ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(originalExtension)
    ) {
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
