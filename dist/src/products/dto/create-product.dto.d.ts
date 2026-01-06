export declare class CreateProductDto {
    name: string;
    description?: string;
    price: number;
    stock: number;
    categoryId?: number;
    subCategoryId?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    isNew?: boolean;
    images?: string[];
    customizationOptions?: any;
}
