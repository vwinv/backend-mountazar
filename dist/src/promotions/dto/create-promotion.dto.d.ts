import { PromotionType } from '@prisma/client';
export declare class CreatePromotionDto {
    name: string;
    description?: string;
    code?: string;
    type: PromotionType;
    value: number;
    banniere?: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
    minPurchase?: number;
    maxUses?: number;
}
