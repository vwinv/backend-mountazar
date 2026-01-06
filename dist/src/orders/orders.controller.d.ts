import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createCustomerOrder(createOrderDto: CreateOrderDto, user: any): Promise<{
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
    getCustomerOrders(user: any): Promise<({
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
    findAll(status?: string, requiresQuote?: string): Promise<({
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
    getMonthlySalesStats(year?: string): Promise<{
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
}
