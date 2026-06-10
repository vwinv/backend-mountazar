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
        urls: never[];
        url: null;
        videos?: undefined;
    } | {
        urls: string[];
        url: string;
        videos: string[];
    }>;
    uploadProductVideo(files: Express.Multer.File[]): Promise<{
        url: null;
    } | {
        url: string;
    }>;
    uploadPromotionBanner(files: Express.Multer.File[]): Promise<{
        url: null;
    } | {
        url: string;
    }>;
}
