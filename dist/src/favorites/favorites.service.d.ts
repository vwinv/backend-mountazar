import { PrismaService } from '../prisma/prisma.service';
export declare class FavoritesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    addFavorite(userId: number, productId: number): Promise<any>;
    removeFavorite(userId: number, productId: number): Promise<any>;
    getFavorites(userId: number): Promise<any>;
    isFavorite(userId: number, productId: number): Promise<boolean>;
}
