import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { images, categoryId, subCategoryId, ...restData } = createProductDto;

    // Validation : le produit doit avoir soit categoryId soit subCategoryId
    if (!categoryId && !subCategoryId) {
      throw new Error('Le produit doit avoir une catégorie ou une sous-catégorie');
    }

    // Préparer les données avec les relations Prisma
    const data: any = {
      ...restData,
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

    // Ensuite, créer les images si elles existent
    if (images && images.length > 0) {
      await (this.prisma as any).productImage.createMany({
        data: images.map((url, index) => ({
          productId: product.id,
          url,
          isMain: index === 0, // La première image est la principale
        })),
      });

      // Recharger le produit avec les images
      const reloaded = await this.prisma.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
        },
      });

      // Charger la sous-catégorie si elle existe
      const subCategory = (product as any).subCategoryId
        ? await (this.prisma as any).subCategory.findUnique({
            where: { id: (product as any).subCategoryId },
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          })
        : null;

      return { ...reloaded, subCategory };
    }

    return product;
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
    
    // Charger les images et sous-catégories séparément pour chaque produit
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await (this.prisma as any).productImage.findMany({
          where: { productId: product.id },
          orderBy: { isMain: 'desc' },
        });
        
        // Charger la sous-catégorie si elle existe
        const subCategory = (product as any).subCategoryId
          ? await (this.prisma as any).subCategory.findUnique({
              where: { id: (product as any).subCategoryId },
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            })
          : null;
        
        return { ...product, images, subCategory };
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

        return { ...product, images, maxRating };
      }),
    );

    return productsWithImages;
  }

  async findPublic(categoryId?: number, search?: string) {
    const where: any = {
      isActive: true,
    };

    // Filtrer par catégorie si fourni
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filtrer par recherche (nom ou description)
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
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

        return { ...product, images, maxRating };
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

    // Charger les images séparément
    const images = await (this.prisma as any).productImage.findMany({
      where: { productId: id },
      orderBy: { isMain: 'desc' },
    });

    // Charger la sous-catégorie si elle existe
    const subCategory = (product as any).subCategoryId
      ? await (this.prisma as any).subCategory.findUnique({
          where: { id: (product as any).subCategoryId },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })
      : null;

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

    return { ...product, images, subCategory, averageRating, maxRating, reviews, reviewsCount: reviews.length };
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

    // Charger les images séparément
    const images = await (this.prisma as any).productImage.findMany({
      where: { productId: id },
      orderBy: { isMain: 'desc' },
    });

    // Charger la sous-catégorie si elle existe
    const subCategory = (product as any).subCategoryId
      ? await (this.prisma as any).subCategory.findUnique({
          where: { id: (product as any).subCategoryId },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })
      : null;

    return { ...product, images, subCategory };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // Vérifier si le produit existe
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Produit avec l'ID ${id} introuvable`);
    }

    const { images, categoryId, subCategoryId, ...restData } = updateProductDto as any;

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

    // Si des images sont fournies, on les met à jour
    if (images !== undefined) {
      // Supprimer toutes les images existantes
      await (this.prisma as any).productImage.deleteMany({
        where: { productId: id },
      });

      // Créer les nouvelles images
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

    // Mettre à jour le produit
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    // Charger les images séparément
    const productImages = await (this.prisma as any).productImage.findMany({
      where: { productId: id },
      orderBy: { isMain: 'desc' },
    });

    // Charger la sous-catégorie si elle existe
    const subCategory = (updatedProduct as any).subCategoryId
      ? await (this.prisma as any).subCategory.findUnique({
          where: { id: (updatedProduct as any).subCategoryId },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })
      : null;

    return { ...updatedProduct, images: productImages, subCategory };
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

