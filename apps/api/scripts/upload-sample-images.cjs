const { readdirSync, readFileSync } = require('node:fs');
const { extname, resolve } = require('node:path');
const {
  R2ImageStorageService,
} = require('../src/upload/storage/r2-image-storage.service');

const DEFAULT_SOURCE_DIR = resolve(
  __dirname,
  '..',
  '..',
  'web',
  'public',
  'sample-images',
);

const MIME_TYPES = {
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function resolveMimeType(fileName) {
  return MIME_TYPES[extname(fileName).toLowerCase()] || 'image/jpeg';
}

function listImageFiles(sourceDir) {
  return readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => Boolean(MIME_TYPES[extname(fileName).toLowerCase()]))
    .sort((left, right) => left.localeCompare(right));
}

async function main() {
  const sourceDir = process.argv[2]
    ? resolve(process.cwd(), process.argv[2])
    : DEFAULT_SOURCE_DIR;
  const imageFiles = listImageFiles(sourceDir);

  if (imageFiles.length === 0) {
    throw new Error(`No image files found in ${sourceDir}.`);
  }

  const storage = new R2ImageStorageService();
  const uploaded = [];

  for (const fileName of imageFiles) {
    const absolutePath = resolve(sourceDir, fileName);
    const buffer = readFileSync(absolutePath);
    const asset = await storage.storeImage({
      buffer,
      originalName: fileName,
      mimeType: resolveMimeType(fileName),
    });

    uploaded.push({
      fileName,
      objectKey: asset.fileName,
      url: asset.url,
    });
  }

  console.log(
    JSON.stringify(
      {
        count: uploaded.length,
        sourceDir,
        uploaded,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : 'Sample image upload to R2 failed.',
  );
  process.exit(1);
});
