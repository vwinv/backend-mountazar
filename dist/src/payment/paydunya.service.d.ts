import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PayDunyaService {
    private readonly prisma;
    private readonly logger;
    private readonly apiBaseUrl;
    private readonly masterKey;
    private readonly privateKey;
    private readonly token;
    constructor(prisma: PrismaService);
    createCheckoutInvoice(orderId: number): Promise<{
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
    payWithWaveSN(createPaymentDto: CreatePaymentDto): Promise<any>;
    payWithOrangeMoneySN(createPaymentDto: CreatePaymentDto): Promise<any>;
    private updatePaymentMethod;
    handleCallback(data: any): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
}
