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
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PromotionsService = class PromotionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPromotionDto) {
        const code = createPromotionDto.code?.trim() || undefined;
        if (code) {
            const existing = await this.prisma.promotion.findUnique({
                where: { code },
            });
            if (existing) {
                throw new common_1.BadRequestException('Un code promotion avec ce nom existe déjà');
            }
        }
        if (new Date(createPromotionDto.startDate) >= new Date(createPromotionDto.endDate)) {
            throw new common_1.BadRequestException('La date de début doit être antérieure à la date de fin');
        }
        if (createPromotionDto.type === 'PERCENTAGE' && createPromotionDto.value > 100) {
            throw new common_1.BadRequestException('Le pourcentage ne peut pas dépasser 100%');
        }
        const valueDecimal = createPromotionDto.value.toString();
        const minPurchaseDecimal = createPromotionDto.minPurchase
            ? createPromotionDto.minPurchase.toString()
            : null;
        return this.prisma.promotion.create({
            data: {
                name: createPromotionDto.name,
                description: createPromotionDto.description || null,
                code: code || null,
                type: createPromotionDto.type,
                value: valueDecimal,
                banniere: createPromotionDto.banniere || null,
                startDate: new Date(createPromotionDto.startDate),
                endDate: new Date(createPromotionDto.endDate),
                isActive: createPromotionDto.isActive ?? true,
                minPurchase: minPurchaseDecimal,
                maxUses: createPromotionDto.maxUses || null,
            },
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findAll() {
        return this.prisma.promotion.findMany({
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const promotion = await this.prisma.promotion.findUnique({
            where: { id },
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });
        if (!promotion) {
            throw new common_1.NotFoundException(`Promotion avec l'ID ${id} introuvable`);
        }
        return promotion;
    }
    async update(id, updatePromotionDto) {
        const existing = await this.prisma.promotion.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Promotion avec l'ID ${id} introuvable`);
        }
        const code = updatePromotionDto.code?.trim() || undefined;
        if (code && code !== existing.code) {
            const existingCode = await this.prisma.promotion.findUnique({
                where: { code },
            });
            if (existingCode) {
                throw new common_1.BadRequestException('Un code promotion avec ce nom existe déjà');
            }
        }
        const startDate = updatePromotionDto.startDate
            ? new Date(updatePromotionDto.startDate)
            : existing.startDate;
        const endDate = updatePromotionDto.endDate
            ? new Date(updatePromotionDto.endDate)
            : existing.endDate;
        if (startDate >= endDate) {
            throw new common_1.BadRequestException('La date de début doit être antérieure à la date de fin');
        }
        const value = updatePromotionDto.value ?? Number(existing.value);
        const type = updatePromotionDto.type ?? existing.type;
        if (type === 'PERCENTAGE' && value > 100) {
            throw new common_1.BadRequestException('Le pourcentage ne peut pas dépasser 100%');
        }
        const updateData = {};
        if (updatePromotionDto.name !== undefined) {
            updateData.name = updatePromotionDto.name;
        }
        if (updatePromotionDto.description !== undefined) {
            updateData.description = updatePromotionDto.description || null;
        }
        if (updatePromotionDto.code !== undefined) {
            updateData.code = code || null;
        }
        if (updatePromotionDto.type !== undefined) {
            updateData.type = updatePromotionDto.type;
        }
        if (updatePromotionDto.banniere !== undefined) {
            updateData.banniere = updatePromotionDto.banniere || null;
        }
        if (updatePromotionDto.isActive !== undefined) {
            updateData.isActive = updatePromotionDto.isActive;
        }
        if (updatePromotionDto.maxUses !== undefined) {
            updateData.maxUses = updatePromotionDto.maxUses || null;
        }
        if (updatePromotionDto.value !== undefined) {
            updateData.value = updatePromotionDto.value.toString();
        }
        if (updatePromotionDto.minPurchase !== undefined) {
            updateData.minPurchase = updatePromotionDto.minPurchase
                ? updatePromotionDto.minPurchase.toString()
                : null;
        }
        if (updatePromotionDto.startDate) {
            updateData.startDate = new Date(updatePromotionDto.startDate);
        }
        if (updatePromotionDto.endDate) {
            updateData.endDate = new Date(updatePromotionDto.endDate);
        }
        return this.prisma.promotion.update({
            where: { id },
            data: updateData,
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async remove(id) {
        const existing = await this.prisma.promotion.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Promotion avec l'ID ${id} introuvable`);
        }
        return this.prisma.promotion.delete({
            where: { id },
        });
    }
    async assignProducts(promotionId, assignProductsDto) {
        const promotion = await this.prisma.promotion.findUnique({
            where: { id: promotionId },
        });
        if (!promotion) {
            throw new common_1.NotFoundException(`Promotion avec l'ID ${promotionId} introuvable`);
        }
        const productIds = [];
        if (assignProductsDto.categoryId) {
            const categoryProducts = await this.prisma.product.findMany({
                where: { categoryId: assignProductsDto.categoryId },
                select: { id: true },
            });
            productIds.push(...categoryProducts.map((p) => p.id));
        }
        if (assignProductsDto.productIds && assignProductsDto.productIds.length > 0) {
            productIds.push(...assignProductsDto.productIds);
        }
        const uniqueProductIds = [...new Set(productIds)];
        if (uniqueProductIds.length === 0) {
            throw new common_1.BadRequestException('Aucun produit à associer');
        }
        const products = await this.prisma.product.findMany({
            where: { id: { in: uniqueProductIds } },
            select: { id: true },
        });
        if (products.length !== uniqueProductIds.length) {
            throw new common_1.BadRequestException('Certains produits n\'existent pas');
        }
        await this.prisma.productPromotion.createMany({
            data: uniqueProductIds.map((productId) => ({
                productId,
                promotionId,
            })),
            skipDuplicates: true,
        });
        return this.findOne(promotionId);
    }
    async removeProduct(promotionId, productId) {
        const promotion = await this.prisma.promotion.findUnique({
            where: { id: promotionId },
        });
        if (!promotion) {
            throw new common_1.NotFoundException(`Promotion avec l'ID ${promotionId} introuvable`);
        }
        await this.prisma.productPromotion.deleteMany({
            where: {
                promotionId,
                productId,
            },
        });
        return this.findOne(promotionId);
    }
    async toggleActive(id) {
        const promotion = await this.prisma.promotion.findUnique({
            where: { id },
        });
        if (!promotion) {
            throw new common_1.NotFoundException(`Promotion avec l'ID ${id} introuvable`);
        }
        return this.prisma.promotion.update({
            where: { id },
            data: { isActive: !promotion.isActive },
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findActiveWithProducts() {
        const now = new Date();
        const promotions = await this.prisma.promotion.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                description: true,
                banniere: true,
                type: true,
                value: true,
                startDate: true,
                endDate: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return promotions;
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map