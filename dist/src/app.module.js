"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const prisma_service_1 = require("./prisma/prisma.service");
const parametrage_module_1 = require("./parametrage/parametrage.module");
const upload_module_1 = require("./upload/upload.module");
const categories_module_1 = require("./categories/categories.module");
const products_module_1 = require("./products/products.module");
const sub_categories_module_1 = require("./sub-categories/sub-categories.module");
const promotions_module_1 = require("./promotions/promotions.module");
const users_module_1 = require("./users/users.module");
const notifications_module_1 = require("./notifications/notifications.module");
const quotes_module_1 = require("./quotes/quotes.module");
const orders_module_1 = require("./orders/orders.module");
const favorites_module_1 = require("./favorites/favorites.module");
const reviews_module_1 = require("./reviews/reviews.module");
const payment_module_1 = require("./payment/payment.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            parametrage_module_1.ParametrageModule,
            upload_module_1.UploadModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            sub_categories_module_1.SubCategoriesModule,
            promotions_module_1.PromotionsModule,
            users_module_1.UsersModule,
            notifications_module_1.NotificationsModule,
            quotes_module_1.QuotesModule,
            orders_module_1.OrdersModule,
            favorites_module_1.FavoritesModule,
            reviews_module_1.ReviewsModule,
            payment_module_1.PaymentModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map