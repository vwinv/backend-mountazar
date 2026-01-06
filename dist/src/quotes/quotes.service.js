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
exports.QuotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let QuotesService = class QuotesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createQuoteDto) {
        const order = await this.prisma.order.findUnique({
            where: { id: createQuoteDto.orderId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Commande avec l'ID ${createQuoteDto.orderId} introuvable`);
        }
        if (!order.requiresQuote) {
            throw new common_1.BadRequestException('Cette commande ne nécessite pas de devis');
        }
        const existingQuote = await this.prisma.quote.findUnique({
            where: { orderId: createQuoteDto.orderId },
        });
        if (existingQuote) {
            throw new common_1.BadRequestException('Un devis existe déjà pour cette commande');
        }
        const quote = await this.prisma.quote.create({
            data: {
                orderId: createQuoteDto.orderId,
                total: createQuoteDto.total,
                notes: createQuoteDto.notes || null,
                validUntil: createQuoteDto.validUntil ? new Date(createQuoteDto.validUntil) : null,
                approvedBy: createQuoteDto.approvedBy || null,
                quoteDetails: createQuoteDto.quoteDetails || null,
                status: 'PENDING',
            },
            include: {
                order: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                phone: true,
                            },
                        },
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });
        await this.prisma.order.update({
            where: { id: createQuoteDto.orderId },
            data: { status: 'QUOTE_PENDING' },
        });
        return quote;
    }
    async findAll(status) {
        const where = {};
        if (status) {
            where.status = status;
        }
        return this.prisma.quote.findMany({
            where,
            include: {
                order: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                phone: true,
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
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const quote = await this.prisma.quote.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                phone: true,
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
                    },
                },
            },
        });
        if (!quote) {
            throw new common_1.NotFoundException(`Devis avec l'ID ${id} introuvable`);
        }
        return quote;
    }
    async update(id, updateQuoteDto) {
        const existing = await this.prisma.quote.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Devis avec l'ID ${id} introuvable`);
        }
        const updateData = {};
        if (updateQuoteDto.total !== undefined) {
            updateData.total = updateQuoteDto.total;
        }
        if (updateQuoteDto.notes !== undefined) {
            updateData.notes = updateQuoteDto.notes || null;
        }
        if (updateQuoteDto.validUntil !== undefined) {
            updateData.validUntil = updateQuoteDto.validUntil ? new Date(updateQuoteDto.validUntil) : null;
        }
        if (updateQuoteDto.status !== undefined) {
            updateData.status = updateQuoteDto.status;
            if (updateQuoteDto.status === 'APPROVED') {
                updateData.approvedAt = new Date();
                await this.prisma.order.update({
                    where: { id: existing.orderId },
                    data: { status: 'QUOTE_APPROVED' },
                });
            }
            else if (updateQuoteDto.status === 'REJECTED') {
                await this.prisma.order.update({
                    where: { id: existing.orderId },
                    data: { status: 'QUOTE_REJECTED' },
                });
            }
        }
        return this.prisma.quote.update({
            where: { id },
            data: updateData,
            include: {
                order: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                phone: true,
                            },
                        },
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async approve(id, approvedBy) {
        const quote = await this.prisma.quote.findUnique({
            where: { id },
        });
        if (!quote) {
            throw new common_1.NotFoundException(`Devis avec l'ID ${id} introuvable`);
        }
        if (quote.status === 'APPROVED') {
            throw new common_1.BadRequestException('Ce devis est déjà approuvé');
        }
        const updated = await this.prisma.quote.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
                approvedBy,
            },
            include: {
                order: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        await this.prisma.order.update({
            where: { id: quote.orderId },
            data: { status: 'QUOTE_APPROVED' },
        });
        return updated;
    }
    async reject(id) {
        const quote = await this.prisma.quote.findUnique({
            where: { id },
        });
        if (!quote) {
            throw new common_1.NotFoundException(`Devis avec l'ID ${id} introuvable`);
        }
        const updated = await this.prisma.quote.update({
            where: { id },
            data: { status: 'REJECTED' },
        });
        await this.prisma.order.update({
            where: { id: quote.orderId },
            data: { status: 'QUOTE_REJECTED' },
        });
        return updated;
    }
    async remove(id) {
        const quote = await this.prisma.quote.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        invoice: {
                            include: {
                                payment: true,
                            },
                        },
                    },
                },
                invoice: true,
            },
        });
        if (!quote) {
            throw new common_1.NotFoundException(`Devis avec l'ID ${id} introuvable`);
        }
        if (quote.invoice) {
            throw new common_1.BadRequestException('Impossible de supprimer un devis associé à une facture');
        }
        if (quote.order?.invoice?.payment?.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Impossible de supprimer un devis dont la commande associée a un paiement complété');
        }
        console.log(`Suppression du devis #${id}`);
        const deletedQuote = await this.prisma.quote.delete({
            where: { id },
        });
        console.log(`Devis #${id} supprimé avec succès`);
        return deletedQuote;
    }
};
exports.QuotesService = QuotesService;
exports.QuotesService = QuotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuotesService);
//# sourceMappingURL=quotes.service.js.map