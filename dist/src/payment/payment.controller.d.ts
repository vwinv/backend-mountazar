import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsController {
    private readonly paymentService;
    private readonly prisma;
    constructor(paymentService: PaymentService, prisma: PrismaService);
    payWithWaveSN(createPaymentDto: CreatePaymentDto, user: any): Promise<{
        success: boolean;
        url: string | null;
        message: any;
    }>;
    payWithOrangeMoneySN(createPaymentDto: CreatePaymentDto, user: any): Promise<{
        success: boolean;
        url: string | null;
        message: any;
    }>;
    handleCallback(data: any): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
    private verifyOrderOwnership;
}
