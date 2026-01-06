import { NotificationType } from '@prisma/client';
export declare class CreateNotificationDto {
    userId?: number;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
}
