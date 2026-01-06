export declare class CloudinaryService {
    constructor();
    uploadImage(file: Express.Multer.File, folder: string): Promise<{
        url: string;
        public_id: string;
    }>;
    uploadImages(files: Express.Multer.File[], folder: string): Promise<{
        url: string;
        public_id: string;
    }[]>;
    deleteImage(publicId: string): Promise<any>;
    deleteImages(publicIds: string[]): Promise<any>;
}
