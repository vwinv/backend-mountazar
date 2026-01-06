import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findFeatured(): Promise<{
        images: any;
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
    findPublicCatalogue(categoryId?: string, search?: string): Promise<{
        images: any;
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
    findOnePublic(id: number): Promise<{
        images: any;
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
    create(createProductDto: CreateProductDto): Promise<({
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
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
    }) | {
        subCategory: any;
        category?: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null | undefined;
        id?: number | undefined;
        name?: string | undefined;
        description?: string | null | undefined;
        price?: import("@prisma/client/runtime/library").Decimal | undefined;
        stock?: number | undefined;
        image?: string | null | undefined;
        isActive?: boolean | undefined;
        isFeatured?: boolean | undefined;
        isNew?: boolean | undefined;
        categoryId?: number | null | undefined;
        subCategoryId?: number | null | undefined;
        customizationOptions?: import(".prisma/client").Prisma.JsonValue | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
    }>;
    findAll(): Promise<{
        images: any;
        subCategory: any;
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
    findOne(id: number): Promise<{
        images: any;
        subCategory: any;
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
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
    }>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<{
        images: any;
        subCategory: any;
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
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
    }>;
    remove(id: number): Promise<{
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
}
