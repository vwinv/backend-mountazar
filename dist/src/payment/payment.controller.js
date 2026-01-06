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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const paydunya_service_1 = require("./paydunya.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsController = class PaymentsController {
    payDunyaService;
    prisma;
    constructor(payDunyaService, prisma) {
        this.payDunyaService = payDunyaService;
        this.prisma = prisma;
        console.log('PaymentsController initialized');
    }
    async createCheckout(orderId) {
        return this.payDunyaService.createCheckoutInvoice(orderId);
    }
    async payWithWaveSN(createPaymentDto, user) {
        try {
            console.log('payWithWaveSN called with:', {
                orderId: createPaymentDto.orderId,
                phoneNumber: createPaymentDto.phoneNumber,
                userId: user?.id
            });
            await this.verifyOrderOwnership(createPaymentDto.orderId, user.id);
            return await this.payDunyaService.payWithWaveSN(createPaymentDto);
        }
        catch (error) {
            console.error('Error in payWithWaveSN:', error);
            throw error;
        }
    }
    async payWithOrangeMoneySN(createPaymentDto, user) {
        await this.verifyOrderOwnership(createPaymentDto.orderId, user.id);
        return this.payDunyaService.payWithOrangeMoneySN(createPaymentDto);
    }
    test() {
        return { message: 'Payment module is working', timestamp: new Date().toISOString() };
    }
    testPost(body) {
        return { message: 'POST route is working', body, timestamp: new Date().toISOString() };
    }
    async handleCallback(data) {
        return this.payDunyaService.handleCallback(data);
    }
    async verifyOrderOwnership(orderId, userId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new common_1.BadRequestException(`Commande avec l'ID ${orderId} introuvable`);
        }
        if (order.userId !== userId) {
            throw new common_1.BadRequestException('Cette commande ne vous appartient pas');
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('checkout/:orderId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('orderId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.Post)('wave-sn'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "payWithWaveSN", null);
__decorate([
    (0, common_1.Post)('orange-money-sn'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "payWithOrangeMoneySN", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "test", null);
__decorate([
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "testPost", null);
__decorate([
    (0, common_1.Post)('callback'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleCallback", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('api/payments'),
    __metadata("design:paramtypes", [paydunya_service_1.PayDunyaService,
        prisma_service_1.PrismaService])
], PaymentsController);
//# sourceMappingURL=payment.controller.js.map