import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpsertShopReviewDto } from './dto/upsert-shop-review.dto';
import { ShopReviewsService } from './shop-reviews.service';

@Controller('api/shop-reviews')
export class ShopReviewsController {
  constructor(private readonly shopReviewsService: ShopReviewsService) {}

  @Get('public')
  findAllPublic() {
    return this.shopReviewsService.findAllPublic();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: any) {
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Seuls les clients peuvent consulter leur avis boutique');
    }

    return this.shopReviewsService.findMine(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(@Body() dto: UpsertShopReviewDto, @CurrentUser() user: any) {
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Seuls les clients peuvent laisser un avis boutique');
    }

    return this.shopReviewsService.upsert(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllAdmin() {
    return this.shopReviewsService.findAllAdmin();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.shopReviewsService.delete(id);
  }
}
