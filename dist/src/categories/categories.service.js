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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCategoryDto) {
        const existing = await this.prisma.category.findUnique({
            where: { name: createCategoryDto.name },
        });
        if (existing) {
            throw new common_1.ConflictException('Une catégorie avec ce nom existe déjà');
        }
        return this.prisma.category.create({
            data: createCategoryDto,
        });
    }
    async findAll() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findAllWithFirstProduct() {
        const categories = await this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
        const categoriesWithProduct = await Promise.all(categories.map(async (category) => {
            const firstProduct = await this.prisma.product.findFirst({
                where: {
                    categoryId: category.id,
                    isActive: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            let firstProductImage = null;
            if (firstProduct) {
                const mainImage = await this.prisma.productImage.findFirst({
                    where: {
                        productId: firstProduct.id,
                        isMain: true,
                    },
                });
                if (!mainImage) {
                    const firstImage = await this.prisma.productImage.findFirst({
                        where: {
                            productId: firstProduct.id,
                        },
                    });
                    firstProductImage = firstImage?.url || null;
                }
                else {
                    firstProductImage = mainImage.url;
                }
            }
            return {
                ...category,
                firstProductImage,
            };
        }));
        return categoriesWithProduct;
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                products: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Catégorie avec l'ID ${id} introuvable`);
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        const existing = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Catégorie avec l'ID ${id} introuvable`);
        }
        if (updateCategoryDto.name && updateCategoryDto.name !== existing.name) {
            const nameExists = await this.prisma.category.findUnique({
                where: { name: updateCategoryDto.name },
            });
            if (nameExists) {
                throw new common_1.ConflictException('Une catégorie avec ce nom existe déjà');
            }
        }
        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }
    async remove(id) {
        const existing = await this.prisma.category.findUnique({
            where: { id },
            include: {
                products: true,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Catégorie avec l'ID ${id} introuvable`);
        }
        if (existing.products.length > 0) {
            throw new common_1.ConflictException('Impossible de supprimer cette catégorie car elle contient des produits');
        }
        return this.prisma.category.delete({
            where: { id },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map