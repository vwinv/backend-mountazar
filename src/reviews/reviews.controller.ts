import {
  Controller,
  Post,
  Body,
  UseGuards,
  ParseIntPipe,
  Param,
  Get,
  Patch,
  ForbiddenException,
  Delete,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewCommentDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: any,
  ) {
    // Vérifier que l'utilisateur est un client
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Seuls les clients peuvent laisser des avis');
    }

    return this.reviewsService.create(user.id, createReviewDto.productId, createReviewDto);
  }

  @Post('rating')
  @UseGuards(JwtAuthGuard)
  async createOrUpdateRating(
    @Body() body: { productId: number; rating: number },
    @CurrentUser() user: any,
  ) {
    // Vérifier que l'utilisateur est un client
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Seuls les clients peuvent noter les produits');
    }

    return this.reviewsService.createOrUpdateRating(user.id, body.productId, body.rating);
  }

  @Patch('comment')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Body() body: { productId: number; comment: string | null },
    @CurrentUser() user: any,
  ) {
    // Vérifier que l'utilisateur est un client
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Seuls les clients peuvent commenter les produits');
    }

    return this.reviewsService.updateComment(user.id, body.productId, body.comment);
  }

  @Get('product/:productId')
  async findAllApprovedByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.findAllApprovedByProduct(productId);
  }

  @Get('product/:productId/user')
  @UseGuards(JwtAuthGuard)
  async findUserReview(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: any,
  ) {
    // Vérifier que l'utilisateur est un client
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Seuls les clients peuvent consulter leurs avis');
    }

    return this.reviewsService.findUserReview(user.id, productId);
  }

  // Routes admin : liste complète des avis et suppression
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.reviewsService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.deleteReview(id);
  }
}

