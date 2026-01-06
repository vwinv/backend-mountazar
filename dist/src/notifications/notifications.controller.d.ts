import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getCustomerNotifications(user: any): Promise<any>;
    create(createNotificationDto: CreateNotificationDto): Promise<any>;
    findAll(userId?: string): Promise<any>;
    markAsRead(id: number, user: any): Promise<any>;
}
