import {
  Controller,
  Get,
  Header,
  Param,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response, Request } from 'express';
import type { UploadImageResponse } from '@basebook/contracts';
import { UploadService } from './upload.service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async uploadImage(
    @Req() request: Request,
    @UploadedFile() file?: { buffer: Buffer; originalname: string; mimetype: string },
  ): Promise<UploadImageResponse> {
    const storedAsset = await this.uploadService.uploadImage(
      file
        ? {
            buffer: file.buffer,
            originalName: file.originalname,
            mimeType: file.mimetype,
          }
        : undefined,
    );

    return {
      asset: {
        id: storedAsset.id,
        fileName: storedAsset.fileName,
        url: `${request.protocol}://${request.get('host')}${storedAsset.urlPath}`,
      },
    };
  }

  @Get('local/:fileName')
  @Header('Cache-Control', 'no-store')
  getStoredImage(@Param('fileName') fileName: string, @Res({ passthrough: true }) response: Response) {
    const { stream, contentType } = this.uploadService.openStoredImage(fileName);
    response.type(contentType);
    return new StreamableFile(stream);
  }
}
