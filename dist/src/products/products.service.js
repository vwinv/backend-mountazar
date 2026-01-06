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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProductDto) {
        const { images, categoryId, subCategoryId, ...restData } = createProductDto;
        if (!categoryId && !subCategoryId) {
            throw new Error('Le produit doit avoir une catégorie ou une sous-catégorie');
        }
        const data = {
            ...restData,
        };
        if (categoryId) {
            data.category = { connect: { id: categoryId } };
        }
        if (subCategoryId) {
            data.subCategory = { connect: { id: subCategoryId } };
        }
        const product = await this.prisma.product.create({
            data,
            include: {
                category: true,
            },
        });
        if (images && images.length > 0) {
            await this.prisma.productImage.createMany({
                data: images.map((url, index) => ({
                    productId: product.id,
                    url,
                    isMain: index === 0,
                })),
            });
            const reloaded = await this.prisma.product.findUnique({
                where: { id: product.id },
                include: {
                    category: true,
                },
            });
            const subCategory = product.subCategoryId
                ? await this.prisma.subCategory.findUnique({
                    where: { id: product.subCategoryId },
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                })
                : null;
            return { ...reloaded, subCategory };
        }
        return product;
    }
    async findAll() {
        const products = await this.prisma.product.findMany({
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const productsWithImages = await Promise.all(products.map(async (product) => {
            const images = await this.prisma.productImage.findMany({
                where: { productId: product.id },
                orderBy: { isMain: 'desc' },
            });
            const subCategory = product.subCategoryId
                ? await this.prisma.subCategory.findUnique({
                    where: { id: product.subCategoryId },
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                })
                : null;
            return { ...product, images, subCategory };
        }));
        return productsWithImages;
    }
    async findFeatured() {
        const products = await this.prisma.product.findMany({
            where: {
                isFeatured: true,
                isActive: true,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                promotions: {
                    include: {
                        promotion: true,
                    },
                    where: {
                        promotion: {
                            isActive: true,
                            startDate: { lte: new Date() },
                            endDate: { gte: new Date() },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const productsWithImages = await Promise.all(products.map(async (product) => {
            const images = await this.prisma.productImage.findMany({
                where: { productId: product.id },
                orderBy: { isMain: 'desc' },
            });
            const reviews = await this.prisma.review.findMany({
                where: {
                    productId: product.id,
                    isApproved: true,
                },
                select: {
                    rating: true,
                },
            });
            let maxRating = 0;
            if (reviews.length > 0) {
                maxRating = Math.max(...reviews.map((r) => r.rating));
            }
            return { ...product, images, maxRating };
        }));
        return productsWithImages;
    }
    async findPublic(categoryId, search) {
        const where = {
            isActive: true,
        };
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (search && search.trim()) {
            where.OR = [
                { name: { contains: search.trim(), mode: 'insensitive' } },
                { description: { contains: search.trim(), mode: 'insensitive' } },
            ];
        }
        const products = await this.prisma.product.findMany({
            where,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                promotions: {
                    where: {
                        promotion: {
                            isActive: true,
                            startDate: { lte: new Date() },
                            endDate: { gte: new Date() },
                        },
                    },
                    include: {
                        promotion: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const productsWithImages = await Promise.all(products.map(async (product) => {
            const images = await this.prisma.productImage.findMany({
                where: { productId: product.id },
                orderBy: { isMain: 'desc' },
            });
            const reviews = await this.prisma.review.findMany({
                where: {
                    productId: product.id,
                    isApproved: true,
                },
                select: {
                    rating: true,
                },
            });
            let maxRating = 0;
            if (reviews.length > 0) {
                maxRating = Math.max(...reviews.map((r) => r.rating));
            }
            return { ...product, images, maxRating };
        }));
        return productsWithImages;
    }
    async findOnePublic(id) {
        const product = await this.prisma.product.findUnique({
            where: { id, isActive: true },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                promotions: {
                    where: {
                        promotion: {
                            isActive: true,
                            startDate: { lte: new Date() },
                            endDate: { gte: new Date() },
                        },
                    },
                    include: {
                        promotion: true,
                    },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Produit avec l'ID ${id} introuvable`);
        }
        const images = await this.prisma.productImage.findMany({
            where: { productId: id },
            orderBy: { isMain: 'desc' },
        });
        const subCategory = product.subCategoryId
            ? await this.prisma.subCategory.findUnique({
                where: { id: product.subCategoryId },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            })
            : null;
        const reviews = await this.prisma.review.findMany({
            where: {
                productId: id,
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
            orderBy: {
                createdAt: 'desc',
            },
        });
        let averageRating = 0;
        let maxRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
            averageRating = Math.round((sum / reviews.length) * 10) / 10;
            maxRating = Math.max(...reviews.map((r) => r.rating));
        }
        return { ...product, images, subCategory, averageRating, maxRating, reviews, reviewsCount: reviews.length };
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Produit avec l'ID ${id} introuvable`);
        }
        const images = await this.prisma.productImage.findMany({
            where: { productId: id },
            orderBy: { isMain: 'desc' },
        });
        const subCategory = product.subCategoryId
            ? await this.prisma.subCategory.findUnique({
                where: { id: product.subCategoryId },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            })
            : null;
        return { ...product, images, subCategory };
    }
    async update(id, updateProductDto) {
        const existing = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Produit avec l'ID ${id} introuvable`);
        }
        const { images, categoryId, subCategoryId, ...restData } = updateProductDto;
        const finalCategoryId = categoryId !== undefined ? categoryId : existing.categoryId;
        const finalSubCategoryId = subCategoryId !== undefined ? subCategoryId : existing.subCategoryId;
        if (!finalCategoryId && !finalSubCategoryId) {
            throw new Error('Le produit doit avoir une catégorie ou une sous-catégorie');
        }
        const data = {
            ...restData,
        };
        if (categoryId !== undefined) {
            if (categoryId === null) {
                data.category = { disconnect: true };
            }
            else {
                data.category = { connect: { id: categoryId } };
            }
        }
        if (subCategoryId !== undefined) {
            if (subCategoryId === null) {
                data.subCategory = { disconnect: true };
            }
            else {
                data.subCategory = { connect: { id: subCategoryId } };
            }
        }
        if (images !== undefined) {
            await this.prisma.productImage.deleteMany({
                where: { productId: id },
            });
            if (images.length > 0) {
                await this.prisma.productImage.createMany({
                    data: images.map((url, index) => ({
                        productId: id,
                        url,
                        isMain: index === 0,
                    })),
                });
            }
        }
        const updatedProduct = await this.prisma.product.update({
            where: { id },
            data,
            include: {
                category: true,
            },
        });
        const productImages = await this.prisma.productImage.findMany({
            where: { productId: id },
            orderBy: { isMain: 'desc' },
        });
        const subCategory = updatedProduct.subCategoryId
            ? await this.prisma.subCategory.findUnique({
                where: { id: updatedProduct.subCategoryId },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            })
            : null;
        return { ...updatedProduct, images: productImages, subCategory };
    }
    async remove(id) {
        const existing = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Produit avec l'ID ${id} introuvable`);
        }
        const orderItems = await this.prisma.orderItem.findMany({
            where: { productId: id },
            take: 1,
        });
        if (orderItems.length > 0) {
            throw new common_1.BadRequestException('Impossible de supprimer ce produit. Il est lié à une commande ou un devis');
        }
        return this.prisma.product.delete({
            where: { id },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map