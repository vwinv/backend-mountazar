"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createNotificationDto) {
        if (createNotificationDto.userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: createNotificationDto.userId },
            });
            if (!user) {
                throw new common_1.NotFoundException(`Utilisateur avec l'ID ${createNotificationDto.userId} introuvable`);
            }
        }
        return this.prisma.notification.create({
            data: {
                userId: createNotificationDto.userId || null,
                title: createNotificationDto.title,
                message: createNotificationDto.message,
                type: createNotificationDto.type || 'INFO',
                link: createNotificationDto.link || null,
            },
        });
    }
    async findAll(userId) {
        const where = {};
        if (userId) {
            where.OR = [
                { userId: null },
                { userId },
            ];
        }
        else {
            where.userId = null;
        }
        return this.prisma.notification.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByUserId(userId) {
        return this.prisma.notification.findMany({
            where: {
                OR: [
                    { userId: null },
                    { userId },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new common_1.NotFoundException(`Notification avec l'ID ${notificationId} introuvable`);
        }
        if (notification.userId !== null && notification.userId !== userId) {
            throw new common_1.NotFoundException('Notification introuvable');
        }
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map