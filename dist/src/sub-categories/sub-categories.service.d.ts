import { PrismaService } from '../prisma/prisma.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
export declare class SubCategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createSubCategoryDto: CreateSubCategoryDto): Promise<{
        category: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        name: string;
        description: string | null;
        categoryId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(categoryId?: number): Promise<({
        category: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        name: string;
        description: string | null;
        categoryId: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: number): Promise<{
        category: {
            id: number;
            name: string;
        };
        products: {
            id: number;
            name: string;
        }[];
    } & {
        id: number;
        name: string;
        description: string | null;
        categoryId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, updateSubCategoryDto: UpdateSubCategoryDto): Promise<{
        category: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        name: string;
        description: string | null;
        categoryId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        description: string | null;
        categoryId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
