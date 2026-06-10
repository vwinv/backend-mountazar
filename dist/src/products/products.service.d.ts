import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private normalizeVideoUrls;
    private loadProductVideos;
    private saveProductVideos;
    private loadSubCategory;
    private buildProductResponse;
    generateDescription(keywords: string): Promise<{
        description: string;
    }>;
    create(createProductDto: CreateProductDto): Promise<any>;
    findAll(): Promise<{
        images: any;
        videos: any;
        videoUrl: any;
        subCategory: any;
        maxRating: number;
        averageRating: number | null;
        reviewsCount: any;
        category: {
            id: number;
            name: string;
        } | null;
        id: number;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        image: string | null;
        isActive: boolean;
        isFeatured: boolean;
        isNew: boolean;
        categoryId: number | null;
        subCategoryId: number | null;
        customizationOptions: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findFeatured(): Promise<{
        images: any;
        videos: any;
        videoUrl: any;
        maxRating: number;
        category: {
            id: number;
            name: string;
        } | null;
        promotions: ({
            promotion: {
                id: number;
                name: string;
                description: string | null;
                code: string | null;
                type: import(".prisma/client").$Enums.PromotionType;
                value: import("@prisma/client/runtime/library").Decimal;
                banniere: string | null;
                startDate: Date;
                endDate: Date;
                isActive: boolean;
                minPurchase: import("@prisma/client/runtime/library").Decimal | null;
                maxUses: number | null;
                currentUses: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            productId: number;
            promotionId: number;
            createdAt: Date;
        })[];
        id: number;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        image: string | null;
        isActive: boolean;
        isFeatured: boolean;
        isNew: boolean;
        categoryId: number | null;
        subCategoryId: number | null;
        customizationOptions: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findPublic(categoryId?: number, search?: string, subCategoryId?: number): Promise<{
        images: any;
        videos: any;
        videoUrl: any;
        maxRating: number;
        category: {
            id: number;
            name: string;
        } | null;
        subCategory: {
            id: number;
            name: string;
            categoryId: number;
        } | null;
        promotions: ({
            promotion: {
                id: number;
                name: string;
                description: string | null;
                code: string | null;
                type: import(".prisma/client").$Enums.PromotionType;
                value: import("@prisma/client/runtime/library").Decimal;
                banniere: string | null;
                startDate: Date;
                endDate: Date;
                isActive: boolean;
                minPurchase: import("@prisma/client/runtime/library").Decimal | null;
                maxUses: number | null;
                currentUses: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            productId: number;
            promotionId: number;
            createdAt: Date;
        })[];
        id: number;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        image: string | null;
        isActive: boolean;
        isFeatured: boolean;
        isNew: boolean;
        categoryId: number | null;
        subCategoryId: number | null;
        customizationOptions: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOnePublic(id: number): Promise<{
        images: any;
        videos: any;
        videoUrl: any;
        subCategory: any;
        averageRating: number;
        maxRating: number;
        reviews: any;
        reviewsCount: any;
        category: {
            id: number;
            name: string;
        } | null;
        promotions: ({
            promotion: {
                id: number;
                name: string;
                description: string | null;
                code: string | null;
                type: import(".prisma/client").$Enums.PromotionType;
                value: import("@prisma/client/runtime/library").Decimal;
                banniere: string | null;
                startDate: Date;
                endDate: Date;
                isActive: boolean;
                minPurchase: import("@prisma/client/runtime/library").Decimal | null;
                maxUses: number | null;
                currentUses: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            productId: number;
            promotionId: number;
            createdAt: Date;
        })[];
        id: number;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        image: string | null;
        isActive: boolean;
        isFeatured: boolean;
        isNew: boolean;
        categoryId: number | null;
        subCategoryId: number | null;
        customizationOptions: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOne(id: number): Promise<any>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<any>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        image: string | null;
        videoUrl: string | null;
        isActive: boolean;
        isFeatured: boolean;
        isNew: boolean;
        categoryId: number | null;
        subCategoryId: number | null;
        customizationOptions: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
