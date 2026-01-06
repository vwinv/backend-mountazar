export declare class CreateQuoteDto {
    orderId: number;
    total: number;
    notes?: string;
    validUntil?: string;
    approvedBy?: number;
    quoteDetails?: {
        items?: Array<{
            length: number;
            width: number;
            pricePerMeter: number;
            total: number;
        }>;
        transportFee?: number;
        discount?: number;
    };
}
