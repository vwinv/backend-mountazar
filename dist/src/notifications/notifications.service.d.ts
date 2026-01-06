import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createNotificationDto: CreateNotificationDto): Promise<any>;
    findAll(userId?: number): Promise<any>;
    findByUserId(userId: number): Promise<any>;
    markAsRead(notificationId: number, userId: number): Promise<any>;
}
