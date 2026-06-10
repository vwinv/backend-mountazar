import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { ShopReviewsController } from './shop-reviews.controller';
import { ShopReviewsService } from './shop-reviews.service';

@Module({
  imports: [AuthModule],
  controllers: [ShopReviewsController],
  providers: [ShopReviewsService, PrismaService],
})
export class ShopReviewsModule {}
