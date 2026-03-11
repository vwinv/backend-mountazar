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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const QUOTE_CATEGORY_NAMES = ['rideaux'];
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCustomerShippingAddresses(userId) {
        return this.prisma.shippingAddress.findMany({
            where: { userId },
            orderBy: { id: 'desc' },
        });
    }
    async saveCustomerShippingAddress(userId, payload) {
        const normalized = {
            firstName: (payload.firstName || '').trim(),
            lastName: (payload.lastName || '').trim(),
            address: (payload.address || '').trim(),
            city: (payload.city || '').trim(),
            postalCode: (payload.postalCode || '').trim() || null,
            country: (payload.country || 'Sénégal').trim(),
            phone: (payload.phone || '').trim() || null,
        };
        const existing = await this.prisma.shippingAddress.findFirst({
            where: {
                userId,
                firstName: normalized.firstName,
                lastName: normalized.lastName,
                address: normalized.address,
                city: normalized.city,
                postalCode: normalized.postalCode,
                country: normalized.country,
                phone: normalized.phone,
            },
        });
        if (existing) {
            return existing;
        }
        return this.prisma.shippingAddress.create({
            data: {
                userId,
                firstName: normalized.firstName,
                lastName: normalized.lastName,
                address: normalized.address,
                city: normalized.city,
                postalCode: normalized.postalCode,
                country: normalized.country,
                phone: normalized.phone,
                isDefault: false,
            },
        });
    }
    async create(createOrderDto) {
        if (!createOrderDto.userId) {
            throw new common_1.BadRequestException('L\'ID utilisateur est requis');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: createOrderDto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${createOrderDto.userId} introuvable`);
        }
        let shippingAddressId = createOrderDto.shippingAddressId;
        if (createOrderDto.shippingAddress && !shippingAddressId) {
            const shippingAddress = await this.prisma.shippingAddress.create({
                data: {
                    userId: createOrderDto.userId,
                    firstName: createOrderDto.shippingAddress.firstName,
                    lastName: createOrderDto.shippingAddress.lastName,
                    address: createOrderDto.shippingAddress.address,
                    city: createOrderDto.shippingAddress.city,
                    postalCode: createOrderDto.shippingAddress.postalCode,
                    country: createOrderDto.shippingAddress.country,
                    phone: createOrderDto.shippingAddress.phone || null,
                    isDefault: false,
                },
            });
            shippingAddressId = shippingAddress.id;
        }
        let total = 0;
        const orderItems = [];
        for (const item of createOrderDto.items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
                include: { category: true },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Produit avec l'ID ${item.productId} introuvable`);
            }
            const categoryName = product.category?.name?.toLowerCase();
            const needsQuote = !!categoryName && QUOTE_CATEGORY_NAMES.includes(categoryName);
            if (needsQuote && !createOrderDto.requiresQuote) {
                throw new common_1.BadRequestException('Ce produit nécessite une demande de devis');
            }
            const price = item.price || Number(product.price);
            const itemTotal = price * item.quantity;
            total += itemTotal;
            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                price,
                originalPrice: Number(product.price),
                customization: item.customization || null,
            });
        }
        let status = 'PROCESSING';
        if (createOrderDto.requiresQuote) {
            status = 'QUOTE_REQUESTED';
        }
        const order = await this.prisma.order.create({
            data: {
                userId: createOrderDto.userId,
                total,
                status: status,
                requiresQuote: createOrderDto.requiresQuote || false,
                shippingAddressId: shippingAddressId || null,
                items: {
                    create: orderItems,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
                shippingAddress: true,
                quote: true,
                invoice: {
                    include: {
                        payment: true,
                    },
                },
            },
        });
        return order;
    }
    async findAll(status, requiresQuote, search) {
        const where = {};
        if (status) {
            where.status = status;
        }
        if (requiresQuote !== undefined) {
            where.requiresQuote = requiresQuote;
        }
        if (search && search.trim().length > 0) {
            const term = search.trim();
            const or = [];
            const idAsNumber = Number(term);
            if (!Number.isNaN(idAsNumber) && Number.isInteger(idAsNumber)) {
                or.push({ id: idAsNumber });
            }
            or.push({
                user: {
                    OR: [
                        { firstName: { contains: term, mode: 'insensitive' } },
                        { lastName: { contains: term, mode: 'insensitive' } },
                        { email: { contains: term, mode: 'insensitive' } },
                        { phone: { contains: term, mode: 'insensitive' } },
                    ],
                },
            });
            where.OR = or;
        }
        return this.prisma.order.findMany({
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
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
                shippingAddress: true,
                quote: true,
                invoice: {
                    include: {
                        payment: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByUserId(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { isMain: true },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                            },
                        },
                        promotion: true,
                    },
                },
                shippingAddress: true,
                quote: true,
                invoice: {
                    include: {
                        payment: true,
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Commande avec l'ID ${id} introuvable`);
        }
        return order;
    }
    async update(id, updateOrderDto) {
        const existing = await this.prisma.order.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Commande avec l'ID ${id} introuvable`);
        }
        return this.prisma.order.update({
            where: { id },
            data: updateOrderDto,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
                shippingAddress: true,
                quote: true,
                invoice: {
                    include: {
                        payment: true,
                    },
                },
            },
        });
    }
    async cancel(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                invoice: {
                    include: {
                        payment: true,
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Commande avec l'ID ${id} introuvable`);
        }
        if (order.invoice?.payment?.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Impossible d\'annuler une commande déjà payée');
        }
        if (order.status !== 'PROCESSING') {
            throw new common_1.BadRequestException('Seules les commandes en cours de traitement peuvent être annulées');
        }
        return this.prisma.order.update({
            where: { id },
            data: { status: 'CANCELLED' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
                shippingAddress: true,
                quote: true,
                invoice: {
                    include: {
                        payment: true,
                    },
                },
            },
        });
    }
    async validatePayment(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                invoice: {
                    include: {
                        payment: true,
                    },
                },
                quote: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Commande avec l'ID ${id} introuvable`);
        }
        let invoice = order.invoice;
        if (!invoice) {
            let subtotal;
            let shipping = 0;
            let discount = 0;
            let total;
            let quoteId = null;
            if (order.quote) {
                const q = order.quote;
                const details = q.quoteDetails || {};
                const items = Array.isArray(details.items) ? details.items : [];
                const itemsTotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
                const transportFee = Number(details.transportFee) || 0;
                discount = Number(details.discount) || 0;
                subtotal = itemsTotal;
                total =
                    (q.total !== undefined ? Number(q.total) : NaN) ||
                        itemsTotal + transportFee - discount;
                shipping = transportFee;
                quoteId = q.id;
            }
            else {
                total = Number(order.total);
                subtotal = total;
            }
            const invoiceNumber = `INV-${Date.now()}-${order.id}`;
            invoice = await this.prisma.invoice.create({
                data: {
                    invoiceNumber,
                    orderId: order.id,
                    quoteId: quoteId ?? undefined,
                    subtotal,
                    tax: 0,
                    shipping,
                    discount,
                    total,
                },
            });
        }
        if (invoice.payment?.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Le paiement a déjà été validé');
        }
        if (invoice.payment) {
            await this.prisma.payment.update({
                where: { id: invoice.payment.id },
                data: {
                    status: 'COMPLETED',
                    paidAt: new Date(),
                },
            });
        }
        else {
            await this.prisma.payment.create({
                data: {
                    invoiceId: invoice.id,
                    amount: invoice.total,
                    method: 'OTHER',
                    status: 'COMPLETED',
                    paidAt: new Date(),
                },
            });
        }
        if (order.quote) {
            await this.prisma.quote.update({
                where: { id: order.quote.id },
                data: {
                    status: 'PAID',
                },
            });
        }
        return this.prisma.order.update({
            where: { id },
            data: { status: 'COMPLETED' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
                shippingAddress: true,
                quote: true,
                invoice: {
                    include: {
                        payment: true,
                    },
                },
            },
        });
    }
    async startDelivery(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { invoice: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Commande avec l'ID ${id} introuvable`);
        }
        if (order.invoice) {
            throw new common_1.BadRequestException('Cette commande a déjà une facture');
        }
        if (order.status !== 'PROCESSING') {
            throw new common_1.BadRequestException('Seules les commandes en cours de traitement peuvent démarrer la livraison');
        }
        return this.prisma.order.update({
            where: { id },
            data: { status: 'SHIPPED' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                items: {
                    include: { product: true },
                },
                shippingAddress: true,
                quote: true,
                invoice: { include: { payment: true } },
            },
        });
    }
    async completeOrder(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { invoice: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Commande avec l'ID ${id} introuvable`);
        }
        if (order.invoice) {
            throw new common_1.BadRequestException('Cette commande a déjà une facture');
        }
        if (order.status !== 'SHIPPED') {
            throw new common_1.BadRequestException('Démarrez d\'abord la livraison avant de terminer la commande');
        }
        return this.prisma.order.update({
            where: { id },
            data: { status: 'DELIVERED' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
                shippingAddress: true,
                quote: true,
                invoice: {
                    include: {
                        payment: true,
                    },
                },
            },
        });
    }
    async getMonthlySalesStats(year) {
        const now = new Date();
        let startDate;
        let endDate;
        if (year) {
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31, 23, 59, 59);
        }
        else {
            startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
            endDate = now;
        }
        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: {
                    not: 'CANCELLED',
                },
            },
            select: {
                total: true,
                createdAt: true,
            },
        });
        const monthlyStats = {};
        if (year) {
            for (let month = 0; month < 12; month++) {
                const date = new Date(year, month, 1);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
                monthlyStats[monthKey] = {
                    month: monthLabel,
                    total: 0,
                    count: 0,
                };
            }
        }
        else {
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
                monthlyStats[monthKey] = {
                    month: monthLabel,
                    total: 0,
                    count: 0,
                };
            }
        }
        orders.forEach((order) => {
            const date = new Date(order.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyStats[monthKey]) {
                monthlyStats[monthKey].total += Number(order.total) || 0;
                monthlyStats[monthKey].count += 1;
            }
        });
        return Object.entries(monthlyStats)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([, value]) => value);
    }
    async getAvailableYears() {
        const orders = await this.prisma.order.findMany({
            where: {
                status: {
                    not: 'CANCELLED',
                },
            },
            select: {
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        const years = new Set();
        orders.forEach((order) => {
            const year = new Date(order.createdAt).getFullYear();
            years.add(year);
        });
        return Array.from(years).sort((a, b) => b - a);
    }
    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const allOrdersCount = await this.prisma.order.count();
        console.log('Total toutes commandes:', allOrdersCount);
        const totalOrders = await this.prisma.order.count({
            where: {
                status: {
                    notIn: ['CANCELLED'],
                },
            },
        });
        console.log('Total commandes (non annulées):', totalOrders);
        const ordersThisMonth = await this.prisma.order.count({
            where: {
                createdAt: {
                    gte: startOfMonth,
                },
                status: {
                    notIn: ['CANCELLED'],
                },
            },
        });
        console.log('Commandes ce mois:', ordersThisMonth);
        const ordersLastMonth = await this.prisma.order.count({
            where: {
                createdAt: {
                    gte: startOfLastMonth,
                    lte: endOfLastMonth,
                },
                status: {
                    notIn: ['CANCELLED'],
                },
            },
        });
        console.log('Commandes mois dernier:', ordersLastMonth);
        const ordersGrowthPercent = ordersLastMonth > 0
            ? Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100)
            : ordersThisMonth > 0 ? 100 : 0;
        const totalProducts = await this.prisma.product.count();
        console.log('Total produits:', totalProducts);
        const totalCustomers = await this.prisma.user.count({
            where: {
                role: 'CUSTOMER',
            },
        });
        console.log('Total clients:', totalCustomers);
        const customersThisMonth = await this.prisma.user.count({
            where: {
                role: 'CUSTOMER',
                createdAt: {
                    gte: startOfMonth,
                },
            },
        });
        console.log('Clients ce mois:', customersThisMonth);
        const customersLastMonth = await this.prisma.user.count({
            where: {
                role: 'CUSTOMER',
                createdAt: {
                    gte: startOfLastMonth,
                    lte: endOfLastMonth,
                },
            },
        });
        console.log('Clients mois dernier:', customersLastMonth);
        const customersGrowthPercent = customersLastMonth > 0
            ? Math.round(((customersThisMonth - customersLastMonth) / customersLastMonth) * 100)
            : customersThisMonth > 0 ? 100 : 0;
        const activePromotions = await this.prisma.promotion.count({
            where: {
                startDate: {
                    lte: now,
                },
                endDate: {
                    gte: now,
                },
                isActive: true,
            },
        });
        console.log('Promotions actives:', activePromotions);
        const stats = {
            orders: {
                total: totalOrders,
                thisMonth: ordersThisMonth,
                growthPercent: ordersGrowthPercent,
            },
            products: {
                total: totalProducts,
            },
            customers: {
                total: totalCustomers,
                thisMonth: customersThisMonth,
                growthPercent: customersGrowthPercent,
            },
            promotions: {
                active: activePromotions,
            },
        };
        console.log('Statistiques du tableau de bord calculées:', stats);
        return stats;
    }
    async remove(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                invoice: {
                    include: {
                        payment: true,
                    },
                },
                quote: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Commande avec l'ID ${id} introuvable`);
        }
        if (order.status !== 'CANCELLED') {
            throw new common_1.BadRequestException('Impossible de supprimer une commande qui n\'est pas annulée');
        }
        if (order.invoice?.payment?.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Impossible de supprimer une commande avec un paiement complété');
        }
        console.log(`Suppression de la commande #${id} (annulée)`);
        const deletedOrder = await this.prisma.order.delete({
            where: { id },
        });
        console.log(`Commande #${id} supprimée avec succès`);
        return deletedOrder;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map