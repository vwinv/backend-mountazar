import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertShopReviewDto } from './dto/upsert-shop-review.dto';

@Injectable()
export class ShopReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(userId: number, dto: UpsertShopReviewDto) {
    const { rating, comment } = dto;

    return this.prisma.shopReview.upsert({
      where: { userId },
      create: {
        userId,
        rating,
        comment: comment?.trim() || null,
        isApproved: true,
      },
      update: {
        rating,
        comment: comment?.trim() || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findMine(userId: number) {
    return this.prisma.shopReview.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAllPublic() {
    return this.prisma.shopReview.findMany({
      where: { isApproved: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.shopReview.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: number) {
    const review = await this.prisma.shopReview.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Avis boutique avec l'ID ${id} introuvable`);
    }

    return this.prisma.shopReview.delete({ where: { id } });
  }
}
