import { SubCategoriesService } from './sub-categories.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
export declare class SubCategoriesController {
    private readonly subCategoriesService;
    constructor(subCategoriesService: SubCategoriesService);
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
    findAll(categoryId?: string): Promise<({
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
