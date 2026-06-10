import { CreateProductDto } from './create-product.dto';
declare const UpdateProductDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateProductDto, "videos" | "videoUrl">>>;
export declare class UpdateProductDto extends UpdateProductDto_base {
    videoUrl?: string | null;
    videos?: string[] | null;
}
export {};
