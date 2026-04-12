const {
  R2ImageStorageService,
} = require('../src/upload/storage/r2-image-storage.service');

const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn0X3sAAAAASUVORK5CYII=',
  'base64',
);

async function main() {
  const asset = await new R2ImageStorageService().storeImage({
    buffer: pngBuffer,
    originalName: 'r2-check.png',
    mimeType: 'image/png',
  });

  console.log(
    JSON.stringify({
      ok: true,
      fileName: asset.fileName,
      url: asset.url,
    }),
  );
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : 'R2 upload check failed.',
  );
  process.exit(1);
});
