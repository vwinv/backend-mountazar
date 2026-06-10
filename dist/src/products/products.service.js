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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const openai_1 = __importDefault(require("openai"));
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizeVideoUrls(videos, videoUrl) {
        const seen = new Set();
        const result = [];
        const add = (value) => {
            const trimmed = value?.trim();
            if (!trimmed || seen.has(trimmed))
                return;
            seen.add(trimmed);
            result.push(trimmed);
        };
        (videos || []).forEach(add);
        if (result.length === 0) {
            add(videoUrl);
        }
        return result;
    }
    async loadProductVideos(productId, legacyVideoUrl) {
        const videos = await this.prisma.productVideo.findMany({
            where: { productId },
            orderBy: { createdAt: 'asc' },
        });
        if (videos.length === 0 && legacyVideoUrl?.trim()) {
            return [{ id: 0, productId, url: legacyVideoUrl.trim(), createdAt: new Date() }];
        }
        return videos;
    }
    async saveProductVideos(productId, videoUrls) {
        await this.prisma.productVideo.deleteMany({
            where: { productId },
        });
        if (videoUrls.length > 0) {
            await this.prisma.productVideo.createMany({
                data: videoUrls.map((url) => ({ productId, url })),
            });
        }
        return this.loadProductVideos(productId, videoUrls[0] ?? null);
    }
    async loadSubCategory(subCategoryId) {
        if (!subCategoryId)
            return null;
        return this.prisma.subCategory.findUnique({
            where: { id: subCategoryId },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    async buildProductResponse(product, images, videos) {
        const productImages = images ??
            (await this.prisma.productImage.findMany({
                where: { productId: product.id },
                orderBy: { isMain: 'desc' },
            }));
        const productVideos = videos ?? (await this.loadProductVideos(product.id, product.videoUrl));
        const subCategory = await this.loadSubCategory(product.subCategoryId);
        return {
            ...product,
            images: productImages,
            videos: productVideos,
            videoUrl: productVideos[0]?.url ?? product.videoUrl ?? null,
            subCategory,
        };
    }
    async generateDescription(keywords) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new common_1.BadRequestException('Génération IA non configurée. Définissez OPENAI_API_KEY dans les variables d\'environnement.');
        }
        const trimmed = keywords?.trim();
        if (!trimmed) {
            throw new common_1.BadRequestException('Veuillez fournir au moins un mot-clé.');
        }
        const openai = new openai_1.default({ apiKey });
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Tu es un rédacteur e-commerce. Tu génères des descriptions de produits en français, professionnelles et vendeuses. Réponds uniquement avec le texte de la description, sans titre ni préambule. Maximum 10 lignes.',
                },
                {
                    role: 'user',
                    content: `Génère une description produit (max 10 lignes) à partir de ces mots-clés : ${trimmed}`,
                },
            ],
            max_tokens: 400,
        });
        const text = completion.choices[0]?.message?.content?.trim();
        if (!text) {
            throw new common_1.BadRequestException('La génération n\'a pas renvoyé de texte.');
        }
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        const description = lines.slice(0, 10).join('\n').trim();
        return { description };
    }
    async create(createProductDto) {
        const { images, videos, videoUrl, categoryId, subCategoryId, ...restData } = createProductDto;
        const videoUrls = this.normalizeVideoUrls(videos, videoUrl);
        if (!categoryId && !subCategoryId) {
            throw new Error('Le produit doit avoir une catégorie ou une sous-catégorie');
        }
        const data = {
            ...restData,
            videoUrl: videoUrls[0] ?? null,
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
        }
        if (videoUrls.length > 0) {
            await this.saveProductVideos(product.id, videoUrls);
        }
        return this.buildProductResponse(product);
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
            const videos = await this.loadProductVideos(product.id, product.videoUrl);
            const subCategory = await this.loadSubCategory(product.subCategoryId);
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
            let averageRating = null;
            let reviewsCount = reviews.length;
            if (reviews.length > 0) {
                const ratings = reviews.map((r) => r.rating);
                maxRating = Math.max(...ratings);
                averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
            }
            return {
                ...product,
                images,
                videos,
                videoUrl: videos[0]?.url ?? product.videoUrl ?? null,
                subCategory,
                maxRating,
                averageRating,
                reviewsCount,
            };
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
            const videos = await this.loadProductVideos(product.id, product.videoUrl);
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
            return {
                ...product,
                images,
                videos,
                videoUrl: videos[0]?.url ?? product.videoUrl ?? null,
                maxRating,
            };
        }));
        return productsWithImages;
    }
    async findPublic(categoryId, search, subCategoryId) {
        const where = {
            isActive: true,
        };
        if (subCategoryId) {
            where.subCategoryId = subCategoryId;
        }
        else if (categoryId) {
            where.OR = [
                { categoryId },
                { subCategory: { categoryId } },
            ];
        }
        if (search && search.trim()) {
            const searchFilter = {
                OR: [
                    { name: { contains: search.trim(), mode: 'insensitive' } },
                    { description: { contains: search.trim(), mode: 'insensitive' } },
                ],
            };
            where.AND = where.AND ? [...where.AND, searchFilter] : [searchFilter];
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
                subCategory: {
                    select: {
                        id: true,
                        name: true,
                        categoryId: true,
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
            const videos = await this.loadProductVideos(product.id, product.videoUrl);
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
            return {
                ...product,
                images,
                videos,
                videoUrl: videos[0]?.url ?? product.videoUrl ?? null,
                maxRating,
            };
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
        const videos = await this.loadProductVideos(id, product.videoUrl);
        const subCategory = await this.loadSubCategory(product.subCategoryId);
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
        return {
            ...product,
            images,
            videos,
            videoUrl: videos[0]?.url ?? product.videoUrl ?? null,
            subCategory,
            averageRating,
            maxRating,
            reviews,
            reviewsCount: reviews.length,
        };
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
        return this.buildProductResponse(product);
    }
    async update(id, updateProductDto) {
        const existing = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Produit avec l'ID ${id} introuvable`);
        }
        const { images, videos, videoUrl, categoryId, subCategoryId, ...restData } = updateProductDto;
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
        let videoUrls;
        if (videos !== undefined) {
            videoUrls = this.normalizeVideoUrls(videos || [], null);
        }
        else if (videoUrl !== undefined) {
            videoUrls = this.normalizeVideoUrls([], videoUrl);
        }
        if (videoUrls !== undefined) {
            data.videoUrl = videoUrls[0] ?? null;
        }
        const updatedProduct = await this.prisma.product.update({
            where: { id },
            data,
            include: {
                category: true,
            },
        });
        let productVideos;
        if (videoUrls !== undefined) {
            productVideos = await this.saveProductVideos(id, videoUrls);
        }
        return this.buildProductResponse(updatedProduct, undefined, productVideos);
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