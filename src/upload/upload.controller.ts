import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CloudinaryService } from './cloudinary.service';
import { memoryStorage } from 'multer';

@Controller('api/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('hero')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024, files: 10 },
    }),
  )
  async uploadHeroImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return { urls: [] };
    }
    const uploadResults = await this.cloudinaryService.uploadImages(
      files,
      'hero',
    );
    const urls = uploadResults.map((result) => result.url);
    return { urls };
  }

  @Post('gallery')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024, files: 20 },
    }),
  )
  async uploadGalleryImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return { urls: [] };
    }
    const uploadResults = await this.cloudinaryService.uploadImages(
      files,
      'gallery',
    );
    const urls = uploadResults.map((result) => result.url);
    return { urls };
  }

  @Post('products')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024, files: 20 },
    }),
  )
  async uploadProductImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return { urls: [], url: null };
    }

    const videoFiles = files.filter((f) => f.mimetype?.startsWith('video/'));
    const imageFiles = files.filter((f) => !f.mimetype?.startsWith('video/'));

    const urls: string[] = [];
    const videos: string[] = [];

    if (imageFiles.length > 0) {
      const uploadResults = await this.cloudinaryService.uploadImages(
        imageFiles,
        'products',
      );
      urls.push(...uploadResults.map((result) => result.url));
    }

    if (videoFiles.length > 0) {
      const uploadResults = await Promise.all(
        videoFiles.map((file) =>
          this.cloudinaryService.uploadVideo(file, 'products/videos'),
        ),
      );
      videos.push(...uploadResults.map((result) => result.url));
    }

    return { urls, url: videos[0] ?? null, videos };
  }

  @Post('products/video')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024, files: 1 },
    }),
  )
  async uploadProductVideo(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return { url: null };
    }
    const uploadResult = await this.cloudinaryService.uploadVideo(
      files[0],
      'products/videos',
    );
    return { url: uploadResult.url };
  }

  @Post('promotions')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    }),
  )
  async uploadPromotionBanner(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return { url: null };
    }
    const uploadResult = await this.cloudinaryService.uploadImage(
      files[0],
      'promotions',
    );
    return { url: uploadResult.url };
  }
}


