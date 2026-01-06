import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createOrderDto: CreateOrderDto): Promise<{
        [x: string]: ({
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        } | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        })[] | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: number;
        userId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        requiresQuote: boolean;
        shippingAddressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(status?: string, requiresQuote?: boolean): Promise<({
        [x: string]: ({
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        } | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        })[] | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: number;
        userId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        requiresQuote: boolean;
        shippingAddressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findByUserId(userId: number): Promise<({
        [x: string]: ({
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        } | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        })[] | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: number;
        userId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        requiresQuote: boolean;
        shippingAddressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: number): Promise<{
        [x: string]: ({
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        } | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        })[] | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: number;
        userId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        requiresQuote: boolean;
        shippingAddressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, updateOrderDto: UpdateOrderDto): Promise<{
        [x: string]: ({
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        } | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        })[] | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: number;
        userId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        requiresQuote: boolean;
        shippingAddressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    cancel(id: number): Promise<{
        [x: string]: ({
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        } | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        })[] | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: number;
        userId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        requiresQuote: boolean;
        shippingAddressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    validatePayment(id: number): Promise<{
        [x: string]: ({
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        } | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        })[] | {
            id: number;
            orderId: number;
            productId: number;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            promotionId: number | null;
            customization: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: number;
        userId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        requiresQuote: boolean;
        shippingAddressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMonthlySalesStats(year?: number): Promise<{
        month: string;
        total: number;
        count: number;
    }[]>;
    getAvailableYears(): Promise<number[]>;
    getDashboardStats(): Promise<{
        orders: {
            total: number;
            thisMonth: number;
            growthPercent: number;
        };
        products: {
            total: number;
        };
        customers: {
            total: number;
            thisMonth: number;
            growthPercent: number;
        };
        promotions: {
            active: number;
        };
    }>;
    remove(id: number): Promise<{
        id: number;
        userId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        requiresQuote: boolean;
        shippingAddressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
