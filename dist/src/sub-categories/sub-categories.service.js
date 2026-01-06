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
exports.SubCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubCategoriesService = class SubCategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSubCategoryDto) {
        const category = await this.prisma.category.findUnique({
            where: { id: createSubCategoryDto.categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Catégorie avec l'ID ${createSubCategoryDto.categoryId} introuvable`);
        }
        const existing = await this.prisma.subCategory.findUnique({
            where: {
                categoryId_name: {
                    categoryId: createSubCategoryDto.categoryId,
                    name: createSubCategoryDto.name,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Une sous-catégorie avec ce nom existe déjà dans cette catégorie');
        }
        return this.prisma.subCategory.create({
            data: createSubCategoryDto,
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
    async findAll(categoryId) {
        const where = categoryId ? { categoryId } : {};
        return this.prisma.subCategory.findMany({
            where,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const subCategory = await this.prisma.subCategory.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                products: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!subCategory) {
            throw new common_1.NotFoundException(`Sous-catégorie avec l'ID ${id} introuvable`);
        }
        return subCategory;
    }
    async update(id, updateSubCategoryDto) {
        const existing = await this.prisma.subCategory.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Sous-catégorie avec l'ID ${id} introuvable`);
        }
        if (updateSubCategoryDto.name || updateSubCategoryDto.categoryId) {
            const categoryId = updateSubCategoryDto.categoryId ?? existing.categoryId;
            const name = updateSubCategoryDto.name ?? existing.name;
            const nameExists = await this.prisma.subCategory.findUnique({
                where: {
                    categoryId_name: {
                        categoryId,
                        name,
                    },
                },
            });
            if (nameExists && nameExists.id !== id) {
                throw new common_1.ConflictException('Une sous-catégorie avec ce nom existe déjà dans cette catégorie');
            }
        }
        if (updateSubCategoryDto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: updateSubCategoryDto.categoryId },
            });
            if (!category) {
                throw new common_1.NotFoundException(`Catégorie avec l'ID ${updateSubCategoryDto.categoryId} introuvable`);
            }
        }
        return this.prisma.subCategory.update({
            where: { id },
            data: updateSubCategoryDto,
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
    async remove(id) {
        const existing = await this.prisma.subCategory.findUnique({
            where: { id },
            include: {
                products: true,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Sous-catégorie avec l'ID ${id} introuvable`);
        }
        if (existing.products.length > 0) {
            throw new common_1.ConflictException('Impossible de supprimer cette sous-catégorie car elle contient des produits');
        }
        return this.prisma.subCategory.delete({
            where: { id },
        });
    }
};
exports.SubCategoriesService = SubCategoriesService;
exports.SubCategoriesService = SubCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubCategoriesService);
//# sourceMappingURL=sub-categories.service.js.map