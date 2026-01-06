import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from '@prisma/client';
declare const UpdateOrderDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateOrderDto>>;
export declare class UpdateOrderDto extends UpdateOrderDto_base {
    status?: OrderStatus;
}
export {};
