import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { AssignProductsDto } from './dto/assign-products.dto';
export declare class PromotionsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    findActivePublic(): Promise<{
        id: number;
        name: string;
        description: string | null;
        type: import(".prisma/client").$Enums.PromotionType;
        value: import("@prisma/client/runtime/library").Decimal;
        banniere: string | null;
        startDate: Date;
        endDate: Date;
    }[]>;
    create(createPromotionDto: CreatePromotionDto): Promise<{
        products: ({
            product: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            productId: number;
            promotionId: number;
            createdAt: Date;
        })[];
    } & {
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
    }>;
    findAll(): Promise<({
        products: ({
            product: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            productId: number;
            promotionId: number;
            createdAt: Date;
        })[];
    } & {
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
    })[]>;
    findOne(id: number): Promise<{
        products: ({
            product: {
                id: number;
                name: string;
                image: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            productId: number;
            promotionId: number;
            createdAt: Date;
        })[];
    } & {
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
    }>;
    update(id: number, updatePromotionDto: UpdatePromotionDto): Promise<{
        products: ({
            product: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            productId: number;
            promotionId: number;
            createdAt: Date;
        })[];
    } & {
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
    }>;
    remove(id: number): Promise<{
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
    }>;
    assignProducts(promotionId: number, assignProductsDto: AssignProductsDto): Promise<{
        products: ({
            product: {
                id: number;
                name: string;
                image: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            productId: number;
            promotionId: number;
            createdAt: Date;
        })[];
    } & {
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
    }>;
    removeProduct(promotionId: number, productId: number): Promise<{
        products: ({
            product: {
                id: number;
                name: string;
                image: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            productId: number;
            promotionId: number;
            createdAt: Date;
        })[];
    } & {
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
    }>;
    toggleActive(id: number): Promise<{
        products: ({
            product: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            productId: number;
            promotionId: number;
            createdAt: Date;
        })[];
    } & {
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
    }>;
}
