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
var PayDunyaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayDunyaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PayDunyaService = PayDunyaService_1 = class PayDunyaService {
    prisma;
    logger = new common_1.Logger(PayDunyaService_1.name);
    apiBaseUrl;
    masterKey;
    privateKey;
    token;
    constructor(prisma) {
        this.prisma = prisma;
        this.apiBaseUrl = process.env.PAYDUNYA_API_URL || 'https://app.paydunya.com/api/v1';
        this.masterKey = process.env.PAYDUNYA_MASTER_KEY || '';
        this.privateKey = process.env.PAYDUNYA_PRIVATE_KEY || '';
        this.token = process.env.PAYDUNYA_TOKEN || '';
    }
    async createCheckoutInvoice(orderId) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    shippingAddress: true,
                    invoice: true,
                },
            });
            if (!order) {
                throw new common_1.BadRequestException(`Commande avec l'ID ${orderId} introuvable`);
            }
            let invoice = order.invoice;
            if (!invoice) {
                const invoiceNumber = `INV-${Date.now()}-${orderId}`;
                const subtotal = Number(order.total);
                const total = subtotal;
                invoice = await this.prisma.invoice.create({
                    data: {
                        invoiceNumber,
                        orderId: order.id,
                        subtotal,
                        tax: 0,
                        shipping: 0,
                        discount: 0,
                        total,
                    },
                });
            }
            const items = {};
            order.items.forEach((item, index) => {
                items[`item_${index}`] = {
                    name: item.product.name,
                    quantity: item.quantity,
                    unit_price: String(Number(item.price)),
                    total_price: String(Number(item.price) * item.quantity),
                    description: item.product.description || '',
                };
            });
            const payload = {
                invoice: {
                    items,
                    taxes: {},
                    total_amount: Math.round(Number(invoice.total)),
                    description: `Commande #${order.id}`,
                },
                store: {
                    name: process.env.STORE_NAME || 'Almadina',
                    tagline: '',
                    postal_address: '',
                    phone: '',
                    logo_url: '',
                    website_url: '',
                },
                custom_data: {
                    order_id: order.id,
                    invoice_id: invoice.id,
                },
                actions: {
                    callback_url: `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/payments/callback`,
                },
            };
            const response = await fetch(`${this.apiBaseUrl}/checkout-invoice/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'PAYDUNYA-MASTER-KEY': this.masterKey,
                    'PAYDUNYA-PRIVATE-KEY': this.privateKey,
                    'PAYDUNYA-TOKEN': this.token,
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Erreur HTTP checkout invoice (${response.status}):`, errorText);
                throw new common_1.BadRequestException(`Erreur API PayDunya: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            this.logger.log('Réponse checkout invoice:', JSON.stringify(data, null, 2));
            if (data.response_code !== '00') {
                const errorMessage = data.response_text || 'Erreur inconnue lors de la création de la facture';
                this.logger.error('Erreur checkout invoice:', errorMessage);
                throw new common_1.BadRequestException(`Erreur PayDunya: ${errorMessage}`);
            }
            const paymentToken = data.token;
            const payment = await this.prisma.payment.upsert({
                where: { invoiceId: invoice.id },
                create: {
                    invoiceId: invoice.id,
                    amount: invoice.total,
                    method: 'OTHER',
                    status: 'PENDING',
                    transactionId: paymentToken,
                },
                update: {
                    transactionId: paymentToken,
                },
            });
            return {
                paymentToken,
                checkoutUrl: data.response_text,
                invoice,
                payment,
            };
        }
        catch (error) {
            this.logger.error('Erreur lors de la création du checkout invoice:', error);
            throw error;
        }
    }
    async payWithWaveSN(createPaymentDto) {
        const { orderId, phoneNumber, fullName, email } = createPaymentDto;
        const { paymentToken } = await this.createCheckoutInvoice(orderId);
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });
        if (!order) {
            throw new common_1.BadRequestException(`Commande avec l'ID ${orderId} introuvable`);
        }
        const customerName = fullName || `${order.user.firstName} ${order.user.lastName}`;
        const customerEmail = email || order.user.email || '';
        let cleanPhoneNumber = phoneNumber.replace(/\s+/g, '');
        if (!cleanPhoneNumber.startsWith('+221') && !cleanPhoneNumber.startsWith('221')) {
            cleanPhoneNumber = cleanPhoneNumber.replace(/^(\+?221)/, '');
            cleanPhoneNumber = `+221${cleanPhoneNumber}`;
        }
        else if (cleanPhoneNumber.startsWith('221') && !cleanPhoneNumber.startsWith('+221')) {
            cleanPhoneNumber = `+${cleanPhoneNumber}`;
        }
        const payload = {
            wave_senegal_fullName: customerName,
            wave_senegal_email: customerEmail || '',
            wave_senegal_phone: cleanPhoneNumber,
            wave_senegal_payment_token: paymentToken
        };
        this.logger.log('Requête Wave SN:', JSON.stringify(payload, null, 2));
        const response = await fetch(`${this.apiBaseUrl}/softpay/wave-senegal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'PAYDUNYA-MASTER-KEY': this.masterKey,
                'PAYDUNYA-PRIVATE-KEY': this.privateKey,
                'PAYDUNYA-TOKEN': this.token,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Erreur HTTP Wave SN (${response.status}):`, errorText);
            throw new common_1.BadRequestException(`Erreur API PayDunya: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        this.logger.log('Réponse Wave SN complète:', JSON.stringify(data, null, 2));
        if (!data.success) {
            const errorMessage = data.message || data.response_text || 'Erreur lors du paiement Wave Sénégal';
            this.logger.error('Erreur Wave SN:', errorMessage);
            throw new common_1.BadRequestException(errorMessage);
        }
        await this.updatePaymentMethod(orderId, 'WAVE_SN');
        const qrCodeUrl = data.url ||
            data.qr_code_url ||
            data.qr_code ||
            data.response_text ||
            data.checkout_url ||
            data.checkout_invoice_url ||
            (data.response && data.response.url) ||
            null;
        this.logger.log('URL QR Code extraite:', qrCodeUrl);
        return {
            success: data.success,
            message: data.message || 'Paiement initié avec succès',
            url: qrCodeUrl,
            ...data
        };
    }
    async payWithOrangeMoneySN(createPaymentDto) {
        const { orderId, phoneNumber, fullName, email } = createPaymentDto;
        const { paymentToken } = await this.createCheckoutInvoice(orderId);
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });
        if (!order) {
            throw new common_1.BadRequestException(`Commande avec l'ID ${orderId} introuvable`);
        }
        const customerName = fullName || `${order.user.firstName} ${order.user.lastName}`;
        const customerEmail = email || order.user.email || '';
        let cleanPhoneNumber = phoneNumber.replace(/\s+/g, '');
        if (cleanPhoneNumber.startsWith('+221')) {
            cleanPhoneNumber = cleanPhoneNumber.substring(1);
        }
        else if (!cleanPhoneNumber.startsWith('221')) {
            cleanPhoneNumber = `221${cleanPhoneNumber}`;
        }
        const payload = {
            customer_name: customerName,
            customer_email: customerEmail,
            phone_number: cleanPhoneNumber,
            invoice_token: paymentToken,
        };
        this.logger.log('Requête Orange Money SN:', JSON.stringify(payload, null, 2));
        const response = await fetch(`${this.apiBaseUrl}/softpay/orange-money-senegal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'PAYDUNYA-MASTER-KEY': this.masterKey,
                'PAYDUNYA-PRIVATE-KEY': this.privateKey,
                'PAYDUNYA-TOKEN': this.token,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Erreur HTTP Orange Money SN (${response.status}):`, errorText);
            throw new common_1.BadRequestException(`Erreur API PayDunya: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        this.logger.log('Réponse Orange Money SN complète:', JSON.stringify(data, null, 2));
        if (!data.success) {
            const errorMessage = data.message || data.response_text || 'Erreur lors du paiement Orange Money Sénégal';
            this.logger.error('Erreur Orange Money SN:', errorMessage);
            throw new common_1.BadRequestException(errorMessage);
        }
        await this.updatePaymentMethod(orderId, 'ORANGE_MONEY_SN');
        let qrCodeUrl = null;
        if (data.other_url && data.other_url.maxit_url) {
            qrCodeUrl = data.other_url.maxit_url;
            this.logger.log('URL maxit_url extraite pour QR code:', qrCodeUrl);
        }
        else {
            qrCodeUrl = data.url ||
                data.qr_code_url ||
                data.qr_code ||
                data.response_text ||
                data.checkout_url ||
                data.checkout_invoice_url ||
                (data.response && data.response.url) ||
                null;
        }
        return {
            success: data.success,
            message: data.message || 'Paiement initié avec succès',
            url: qrCodeUrl,
            ...data
        };
    }
    async updatePaymentMethod(orderId, method) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { invoice: { include: { payment: true } } },
        });
        if (order?.invoice?.payment) {
            await this.prisma.payment.update({
                where: { id: order.invoice.payment.id },
                data: {
                    method: method,
                },
            });
        }
    }
    async handleCallback(data) {
        this.logger.log('Callback PayDunya reçu:', JSON.stringify(data, null, 2));
        try {
            const transactionToken = data.token || data.invoice_token || data.payment_token;
            if (!transactionToken) {
                this.logger.error('Token manquant dans le callback PayDunya');
                return { success: false, message: 'Token manquant' };
            }
            const isCompleted = data.status === 'completed' ||
                data.status === 'success' ||
                data.response_code === '00' ||
                (data.response && data.response.status === 'completed');
            if (isCompleted) {
                const payment = await this.prisma.payment.findUnique({
                    where: { transactionId: transactionToken },
                    include: { invoice: { include: { order: true } } },
                });
                if (payment) {
                    await this.prisma.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'COMPLETED',
                            paidAt: new Date(),
                        },
                    });
                    await this.prisma.order.update({
                        where: { id: payment.invoice.orderId },
                        data: { status: 'PROCESSING' },
                    });
                    this.logger.log(`Paiement ${transactionToken} marqué comme complété`);
                }
                else {
                    this.logger.warn(`Paiement avec token ${transactionToken} non trouvé en base de données`);
                }
            }
            else {
                this.logger.log(`Paiement ${transactionToken} en attente (status: ${data.status})`);
            }
            return { success: true };
        }
        catch (error) {
            this.logger.error('Erreur lors du traitement du callback PayDunya:', error);
            throw error;
        }
    }
};
exports.PayDunyaService = PayDunyaService;
exports.PayDunyaService = PayDunyaService = PayDunyaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayDunyaService);
//# sourceMappingURL=paydunya.service.js.map