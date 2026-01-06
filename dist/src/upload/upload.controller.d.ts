import { CloudinaryService } from './cloudinary.service';
export declare class UploadController {
    private readonly cloudinaryService;
    constructor(cloudinaryService: CloudinaryService);
    uploadHeroImages(files: Express.Multer.File[]): Promise<{
        urls: string[];
    }>;
    uploadGalleryImages(files: Express.Multer.File[]): Promise<{
        urls: string[];
    }>;
    uploadProductImages(files: Express.Multer.File[]): Promise<{
        urls: string[];
    }>;
    uploadPromotionBanner(files: Express.Multer.File[]): Promise<{
        url: null;
    } | {
        url: string;
    }>;
}
