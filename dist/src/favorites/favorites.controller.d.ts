import { FavoritesService } from './favorites.service';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    private checkIsCustomer;
    getFavorites(user: any): Promise<any>;
    addFavorite(user: any, productId: number): Promise<any>;
    removeFavorite(user: any, productId: number): Promise<any>;
    checkFavorite(user: any, productId: number): Promise<boolean>;
}
