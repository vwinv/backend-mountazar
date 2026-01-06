import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { ParametrageModule } from './parametrage/parametrage.module';
import { UploadModule } from './upload/upload.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { SubCategoriesModule } from './sub-categories/sub-categories.module';
import { PromotionsModule } from './promotions/promotions.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { QuotesModule } from './quotes/quotes.module';
import { OrdersModule } from './orders/orders.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    AuthModule,
    ParametrageModule,
    UploadModule,
    CategoriesModule,
    ProductsModule,
    SubCategoriesModule,
    PromotionsModule,
    UsersModule,
    NotificationsModule,
    QuotesModule,
    OrdersModule,
    FavoritesModule,
    ReviewsModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
