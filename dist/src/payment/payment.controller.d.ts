import { PayDunyaService } from './paydunya.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsController {
    private readonly payDunyaService;
    private readonly prisma;
    constructor(payDunyaService: PayDunyaService, prisma: PrismaService);
    createCheckout(orderId: number): Promise<{
        paymentToken: any;
        checkoutUrl: any;
        invoice: {
            id: number;
            invoiceNumber: string;
            orderId: number;
            quoteId: number | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            tax: import("@prisma/client/runtime/library").Decimal;
            shipping: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        payment: {
            id: number;
            invoiceId: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            method: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.PaymentStatus;
            transactionId: string | null;
            receiptUrl: string | null;
            invoiceData: string | null;
            paidAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    payWithWaveSN(createPaymentDto: CreatePaymentDto, user: any): Promise<any>;
    payWithOrangeMoneySN(createPaymentDto: CreatePaymentDto, user: any): Promise<any>;
    test(): {
        message: string;
        timestamp: string;
    };
    testPost(body: any): {
        message: string;
        body: any;
        timestamp: string;
    };
    handleCallback(data: any): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
    private verifyOrderOwnership;
}
