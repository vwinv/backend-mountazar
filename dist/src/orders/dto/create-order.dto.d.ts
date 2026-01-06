declare class OrderItemDto {
    productId: number;
    quantity: number;
    price?: number;
    customization?: any;
}
declare class ShippingAddressDto {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
}
export declare class CreateOrderDto {
    userId?: number;
    items: OrderItemDto[];
    shippingAddressId?: number;
    requiresQuote?: boolean;
    shippingAddress?: ShippingAddressDto;
}
export {};
