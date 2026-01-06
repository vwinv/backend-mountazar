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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrUpdateRating(userId, productId, rating) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new common_1.NotFoundException(`Produit avec l'ID ${productId} introuvable`);
        }
        const existingReview = await this.prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        let review;
        if (existingReview) {
            review = await this.prisma.review.update({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
                data: {
                    rating,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });
        }
        else {
            review = await this.prisma.review.create({
                data: {
                    userId,
                    productId,
                    rating,
                    comment: null,
                    isApproved: true,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });
        }
        return review;
    }
    async updateComment(userId, productId, comment) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new common_1.NotFoundException(`Produit avec l'ID ${productId} introuvable`);
        }
        const existingReview = await this.prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        let review;
        if (existingReview) {
            review = await this.prisma.review.update({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
                data: {
                    comment,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });
        }
        else {
            review = await this.prisma.review.create({
                data: {
                    userId,
                    productId,
                    rating: 0,
                    comment,
                    isApproved: true,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });
        }
        return review;
    }
    async create(userId, productId, createReviewDto) {
        const { rating, comment } = createReviewDto;
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new common_1.NotFoundException(`Produit avec l'ID ${productId} introuvable`);
        }
        const existingReview = await this.prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        if (existingReview) {
            throw new common_1.BadRequestException('Vous avez déjà laissé un avis pour ce produit.');
        }
        const review = await this.prisma.review.create({
            data: {
                userId,
                productId,
                rating,
                comment,
                isApproved: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return review;
    }
    async findAllApprovedByProduct(productId) {
        return this.prisma.review.findMany({
            where: {
                productId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findUserReview(userId, productId) {
        return this.prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }
    async findAll() {
        return this.prisma.review.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveReview(id) {
        return this.prisma.review.update({
            where: { id },
            data: { isApproved: true },
        });
    }
    async deleteReview(id) {
        return this.prisma.review.delete({
            where: { id },
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map