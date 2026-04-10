export type StoredImageAsset = {
  id: string;
  fileName: string;
  urlPath: string;
};

export type UploadableImage = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
};

export interface ImageStoragePort {
  storeImage(file: UploadableImage): Promise<StoredImageAsset>;
  resolveStoredPath(fileName: string): string;
}

export const IMAGE_STORAGE = Symbol('IMAGE_STORAGE');
