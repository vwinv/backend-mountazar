import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import OpenAI from 'openai';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeVideoUrls(videos?: string[], videoUrl?: string | null): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    const add = (value?: string | null) => {
      const trimmed = value?.trim();
      if (!trimmed || seen.has(trimmed)) return;
      seen.add(trimmed);
      result.push(trimmed);
    };

    (videos || []).forEach(add);
    if (result.length === 0) {
      add(videoUrl);
    }

    return result;
  }

  private async loadProductVideos(productId: number, legacyVideoUrl?: string | null) {
    const videos = await (this.prisma as any).productVideo.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });

    if (videos.length === 0 && legacyVideoUrl?.trim()) {
      return [{ id: 0, productId, url: legacyVideoUrl.trim(), createdAt: new Date() }];
    }

    return videos;
  }

  private async saveProductVideos(productId: number, videoUrls: string[]) {
    await (this.prisma as any).productVideo.deleteMany({
      where: { productId },
    });

    if (videoUrls.length > 0) {
      await (this.prisma as any).productVideo.createMany({
        data: videoUrls.map((url) => ({ productId, url })),
      });
    }

    return this.loadProductVideos(productId, videoUrls[0] ?? null);
  }

  private async loadSubCategory(subCategoryId?: number | null) {
    if (!subCategoryId) return null;

    return (this.prisma as any).subCategory.findUnique({
      where: { id: subCategoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  private async buildProductResponse(product: any, images?: any[], videos?: any[]) {
    const productImages =
      images ??
      (await (this.prisma as any).productImage.findMany({
        where: { productId: product.id },
        orderBy: { isMain: 'desc' },
      }));

    const productVideos =
      videos ?? (await this.loadProductVideos(product.id, product.videoUrl));

    const subCategory = await this.loadSubCategory(product.subCategoryId);

    return {
      ...product,
      images: productImages,
      videos: productVideos,
      videoUrl: productVideos[0]?.url ?? product.videoUrl ?? null,
      subCategory,
    };
  }

  /**
   * Génère une description produit (max 10 lignes) à partir de mots-clés via OpenAI.
   */
  async generateDescription(keywords: string): Promise<{ description: string }> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new BadRequestException(
        'Génération IA non configurée. Définissez OPENAI_API_KEY dans les variables d\'environnement.',
      );
    }
    const trimmed = keywords?.trim();
    if (!trimmed) {
      throw new BadRequestException('Veuillez fournir au moins un mot-clé.');
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Tu es un rédacteur e-commerce. Tu génères des descriptions de produits en français, professionnelles et vendeuses. Réponds uniquement avec le texte de la description, sans titre ni préambule. Maximum 10 lignes.',
        },
        {
          role: 'user',
          content: `Génère une description produit (max 10 lignes) à partir de ces mots-clés : ${trimmed}`,
        },
      ],
      max_tokens: 400,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new BadRequestException('La génération n\'a pas renvoyé de texte.');
    }

    // S'assurer qu'on ne dépasse pas ~10 lignes
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const description = lines.slice(0, 10).join('\n').trim();
    return { description };
  }

  async create(createProductDto: CreateProductDto) {
    const { images, videos, videoUrl, categoryId, subCategoryId, ...restData } =
      createProductDto;
    const videoUrls = this.normalizeVideoUrls(videos, videoUrl);

    // Validation : le produit doit avoir soit categoryId soit subCategoryId
    if (!categoryId && !subCategoryId) {
      throw new Error('Le produit doit avoir une catégorie ou une sous-catégorie');
    }

    // Préparer les données avec les relations Prisma
    const data: any = {
      ...restData,
      videoUrl: videoUrls[0] ?? null,
    };

    // Utiliser la syntaxe Prisma pour les relations
    if (categoryId) {
      data.category = { connect: { id: categoryId } };
    }

    if (subCategoryId) {
      data.subCategory = { connect: { id: subCategoryId } };
    }

    // Créer le produit d'abord
    const product = await this.prisma.product.create({
      data,
      include: {
        category: true,
      },
    });

    if (images && images.length > 0) {
      await (this.prisma as any).productImage.createMany({
        data: images.map((url, index) => ({
          productId: product.id,
          url,
          isMain: index === 0,
        })),
      });
    }

    if (videoUrls.length > 0) {
      await this.saveProductVideos(product.id, videoUrls);
    }

    return this.buildProductResponse(product);
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Charger les images, sous-catégories et statistiques d'avis pour chaque produit
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await (this.prisma as any).productImage.findMany({
          where: { productId: product.id },
          orderBy: { isMain: 'desc' },
        });

        const videos = await this.loadProductVideos(product.id, product.videoUrl);

        // Charger la sous-catégorie si elle existe
        const subCategory = await this.loadSubCategory((product as any).subCategoryId);

        // Statistiques d'avis (avis approuvés uniquement)
        const reviews = await (this.prisma as any).review.findMany({
          where: {
            productId: product.id,
            isApproved: true,
          },
          select: {
            rating: true,
          },
        });

        let maxRating = 0;
        let averageRating: number | null = null;
        let reviewsCount = reviews.length;

        if (reviews.length > 0) {
          const ratings = reviews.map((r: any) => r.rating);
          maxRating = Math.max(...ratings);
          averageRating = ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length;
        }
        
        return {
          ...product,
          images,
          videos,
          videoUrl: videos[0]?.url ?? product.videoUrl ?? null,
          subCategory,
          maxRating,
          averageRating,
          reviewsCount,
        };
      })
    );
    
    return productsWithImages;
  }

  async findFeatured() {
    const products = await this.prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        promotions: {
          include: {
            promotion: true,
          },
          where: {
            promotion: {
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Charger les images et la note maximale pour chaque produit
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await (this.prisma as any).productImage.findMany({
          where: { productId: product.id },
          orderBy: { isMain: 'desc' },
        });

        const videos = await this.loadProductVideos(product.id, product.videoUrl);

        // Récupérer la note maximale des avis approuvés
        const reviews = await (this.prisma as any).review.findMany({
          where: {
            productId: product.id,
            isApproved: true,
          },
          select: {
            rating: true,
          },
        });

        let maxRating = 0;
        if (reviews.length > 0) {
          maxRating = Math.max(...reviews.map((r: any) => r.rating));
        }

        return {
          ...product,
          images,
          videos,
          videoUrl: videos[0]?.url ?? product.videoUrl ?? null,
          maxRating,
        };
      }),
    );

    return productsWithImages;
  }

  async findPublic(categoryId?: number, search?: string, subCategoryId?: number) {
    const where: any = {
      isActive: true,
    };

    if (subCategoryId) {
      where.subCategoryId = subCategoryId;
    } else if (categoryId) {
      where.OR = [
        { categoryId },
        { subCategory: { categoryId } },
      ];
    }

    if (search && search.trim()) {
      const searchFilter = {
        OR: [
          { name: { contains: search.trim(), mode: 'insensitive' } },
          { description: { contains: search.trim(), mode: 'insensitive' } },
        ],
      };

      where.AND = where.AND ? [...where.AND, searchFilter] : [searchFilter];
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            categoryId: true,
          },
        },
        promotions: {
          where: {
            promotion: {
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
          },
          include: {
            promotion: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Charger les images et la note maximale pour chaque produit
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await (this.prisma as any).productImage.findMany({
          where: { productId: product.id },
          orderBy: { isMain: 'desc' },
        });

        const videos = await this.loadProductVideos(product.id, product.videoUrl);

        // Récupérer la note maximale des avis approuvés
        const reviews = await (this.prisma as any).review.findMany({
          where: {
            productId: product.id,
            isApproved: true,
          },
          select: {
            rating: true,
          },
        });

        let maxRating = 0;
        if (reviews.length > 0) {
          maxRating = Math.max(...reviews.map((r: any) => r.rating));
        }

        return {
          ...product,
          images,
          videos,
          videoUrl: videos[0]?.url ?? product.videoUrl ?? null,
          maxRating,
        };
      }),
    );

    return productsWithImages;
  }

  async findOnePublic(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id, isActive: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        promotions: {
          where: {
            promotion: {
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
          },
          include: {
            promotion: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} introuvable`);
    }

    const images = await (this.prisma as any).productImage.findMany({
      where: { productId: id },
      orderBy: { isMain: 'desc' },
    });

    const videos = await this.loadProductVideos(id, product.videoUrl);
    const subCategory = await this.loadSubCategory((product as any).subCategoryId);

    // Récupérer les avis approuvés avec les informations utilisateur
    const reviews = await (this.prisma as any).review.findMany({
      where: {
        productId: id,
        isApproved: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculer la note moyenne et la note maximale
    let averageRating = 0;
    let maxRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
      averageRating = Math.round((sum / reviews.length) * 10) / 10; // Arrondir à 1 décimale
      maxRating = Math.max(...reviews.map((r: any) => r.rating));
    }

    return {
      ...product,
      images,
      videos,
      videoUrl: videos[0]?.url ?? product.videoUrl ?? null,
      subCategory,
      averageRating,
      maxRating,
      reviews,
      reviewsCount: reviews.length,
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} introuvable`);
    }

    return this.buildProductResponse(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // Vérifier si le produit existe
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Produit avec l'ID ${id} introuvable`);
    }

    const { images, videos, videoUrl, categoryId, subCategoryId, ...restData } =
      updateProductDto as any;

    // Validation : le produit doit avoir soit categoryId soit subCategoryId après mise à jour
    const finalCategoryId = categoryId !== undefined ? categoryId : (existing as any).categoryId;
    const finalSubCategoryId = subCategoryId !== undefined ? subCategoryId : (existing as any).subCategoryId;
    
    if (!finalCategoryId && !finalSubCategoryId) {
      throw new Error('Le produit doit avoir une catégorie ou une sous-catégorie');
    }

    // Préparer les données de mise à jour avec la syntaxe Prisma pour les relations
    const data: any = {
      ...restData,
    };

    // Gérer les relations avec la syntaxe Prisma
    if (categoryId !== undefined) {
      if (categoryId === null) {
        data.category = { disconnect: true };
      } else {
        data.category = { connect: { id: categoryId } };
      }
    }

    if (subCategoryId !== undefined) {
      if (subCategoryId === null) {
        data.subCategory = { disconnect: true };
      } else {
        data.subCategory = { connect: { id: subCategoryId } };
      }
    }

    if (images !== undefined) {
      await (this.prisma as any).productImage.deleteMany({
        where: { productId: id },
      });

      if (images.length > 0) {
        await (this.prisma as any).productImage.createMany({
          data: images.map((url, index) => ({
            productId: id,
            url,
            isMain: index === 0,
          })),
        });
      }
    }

    let videoUrls: string[] | undefined;
    if (videos !== undefined) {
      videoUrls = this.normalizeVideoUrls(videos || [], null);
    } else if (videoUrl !== undefined) {
      videoUrls = this.normalizeVideoUrls([], videoUrl);
    }

    if (videoUrls !== undefined) {
      data.videoUrl = videoUrls[0] ?? null;
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    let productVideos;
    if (videoUrls !== undefined) {
      productVideos = await this.saveProductVideos(id, videoUrls);
    }

    return this.buildProductResponse(updatedProduct, undefined, productVideos);
  }

  async remove(id: number) {
    // Vérifier si le produit existe
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Produit avec l'ID ${id} introuvable`);
    }

    // Vérifier si le produit est lié à une commande ou un devis
    const orderItems = await (this.prisma as any).orderItem.findMany({
      where: { productId: id },
      take: 1, // On a juste besoin de savoir s'il y en a au moins un
    });

    if (orderItems.length > 0) {
      throw new BadRequestException(
        'Impossible de supprimer ce produit. Il est lié à une commande ou un devis',
      );
    }

    // Les images seront supprimées automatiquement grâce à onDelete: Cascade
    return this.prisma.product.delete({
      where: { id },
    });
  }
}

