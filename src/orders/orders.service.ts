import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    // Vérifier que l'utilisateur existe
    if (!createOrderDto.userId) {
      throw new BadRequestException('L\'ID utilisateur est requis');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: createOrderDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${createOrderDto.userId} introuvable`);
    }

    // Créer l'adresse de livraison si fournie
    let shippingAddressId = createOrderDto.shippingAddressId;
    if (createOrderDto.shippingAddress && !shippingAddressId) {
      const shippingAddress = await (this.prisma as any).shippingAddress.create({
        data: {
          userId: createOrderDto.userId,
          firstName: createOrderDto.shippingAddress.firstName,
          lastName: createOrderDto.shippingAddress.lastName,
          address: createOrderDto.shippingAddress.address,
          city: createOrderDto.shippingAddress.city,
          postalCode: createOrderDto.shippingAddress.postalCode,
          country: createOrderDto.shippingAddress.country,
          phone: createOrderDto.shippingAddress.phone || null,
          isDefault: false,
        },
      });
      shippingAddressId = shippingAddress.id;
    }

    // Vérifier que les produits existent et calculer le total
    let total = 0;
    const orderItems: any[] = [];

    for (const item of createOrderDto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: { category: true },
      });

      if (!product) {
        throw new NotFoundException(`Produit avec l'ID ${item.productId} introuvable`);
      }

      // Vérifier si le produit nécessite un devis (catégorie "rideaux")
      const isRideaux = product.category?.name.toLowerCase() === 'rideaux';
      
      if (isRideaux && !createOrderDto.requiresQuote) {
        throw new BadRequestException('Les produits de la catégorie "rideaux" nécessitent une demande de devis');
      }

      const price = item.price || Number(product.price);
      const itemTotal = price * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
        originalPrice: Number(product.price),
        customization: item.customization || null,
      });
    }

    // Déterminer le statut initial
    let status = 'PENDING';
    if (createOrderDto.requiresQuote) {
      status = 'QUOTE_REQUESTED';
    }

    // Créer la commande
    const order = await this.prisma.order.create({
      data: {
        userId: createOrderDto.userId,
        total,
        status: status as any,
        requiresQuote: createOrderDto.requiresQuote || false,
        shippingAddressId: shippingAddressId || null,
        items: {
          create: orderItems,
        },
      } as any,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        shippingAddress: true,
        quote: true,
        invoice: {
          include: {
            payment: true,
          },
        },
      } as any,
    });

    return order;
  }

  async findAll(status?: string, requiresQuote?: boolean) {
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (requiresQuote !== undefined) {
      where.requiresQuote = requiresQuote;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        shippingAddress: true,
        quote: true,
        invoice: {
          include: {
            payment: true,
          },
        },
      } as any,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isMain: true },
                  take: 1,
                },
              },
            },
          },
        },
      } as any,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
            promotion: true,
          },
        },
        shippingAddress: true,
        quote: true,
        invoice: {
          include: {
            payment: true,
          },
        },
      } as any,
    });

    if (!order) {
      throw new NotFoundException(`Commande avec l'ID ${id} introuvable`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const existing = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Commande avec l'ID ${id} introuvable`);
    }

    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto as any,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        quote: true,
        invoice: {
          include: {
            payment: true,
          },
        },
      } as any,
    });
  }

  async cancel(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Commande avec l'ID ${id} introuvable`);
    }

    // Vérifier si le paiement a été effectué
    if (order.invoice?.payment?.status === 'COMPLETED') {
      throw new BadRequestException('Impossible d\'annuler une commande déjà payée');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' as any },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        quote: true,
        invoice: {
          include: {
            payment: true,
          },
        },
      } as any,
    });
  }

  async validatePayment(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Commande avec l'ID ${id} introuvable`);
    }

    if (!order.invoice) {
      throw new BadRequestException('Aucune facture associée à cette commande');
    }

    if (order.invoice.payment?.status === 'COMPLETED') {
      throw new BadRequestException('Le paiement a déjà été validé');
    }

    // Mettre à jour le statut du paiement
    if (order.invoice.payment) {
      await (this.prisma as any).payment.update({
        where: { id: order.invoice.payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });
    } else {
      // Créer le paiement si il n'existe pas
      await (this.prisma as any).payment.create({
        data: {
          invoiceId: order.invoice.id,
          amount: order.invoice.total,
          method: 'OTHER',
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });
    }

    // Mettre à jour le statut de la commande
    return this.prisma.order.update({
      where: { id },
      data: { status: 'PROCESSING' as any },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        quote: true,
        invoice: {
          include: {
            payment: true,
          },
        },
      } as any,
    });
  }

  /**
   * Récupère les statistiques de ventes par mois
   * @param year Année optionnelle. Si fournie, affiche les 12 mois de cette année. Sinon, affiche les 12 derniers mois.
   */
  async getMonthlySalesStats(year?: number) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    if (year) {
      // Si une année est fournie, afficher les 12 mois de cette année
      startDate = new Date(year, 0, 1); // 1er janvier
      endDate = new Date(year, 11, 31, 23, 59, 59); // 31 décembre
    } else {
      // Sinon, afficher les 12 derniers mois
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      endDate = now;
    }
    
    // Récupérer toutes les commandes de la période
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Grouper par mois
    const monthlyStats: { [key: string]: { month: string; total: number; count: number } } = {};
    
    if (year) {
      // Si une année est fournie, initialiser les 12 mois de cette année
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        monthlyStats[monthKey] = {
          month: monthLabel,
          total: 0,
          count: 0,
        };
      }
    } else {
      // Sinon, initialiser les 12 derniers mois
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        monthlyStats[monthKey] = {
          month: monthLabel,
          total: 0,
          count: 0,
        };
      }
    }

    // Agréger les données
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyStats[monthKey]) {
        monthlyStats[monthKey].total += Number(order.total) || 0;
        monthlyStats[monthKey].count += 1;
      }
    });

    // Convertir en tableau et trier par clé de mois
    return Object.entries(monthlyStats)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([, value]) => value);
  }

  /**
   * Récupère la liste des années disponibles dans les commandes
   */
  async getAvailableYears(): Promise<number[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        status: {
          not: 'CANCELLED',
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const years = new Set<number>();
    orders.forEach((order) => {
      const year = new Date(order.createdAt).getFullYear();
      years.add(year);
    });

    return Array.from(years).sort((a, b) => b - a); // Tri décroissant
  }

  /**
   * Récupère les statistiques du tableau de bord
   */
  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Test: Compter toutes les commandes d'abord
    const allOrdersCount = await this.prisma.order.count();
    console.log('Total toutes commandes:', allOrdersCount);

    // Total des commandes (non annulées) - Utiliser notIn pour exclure CANCELLED
    const totalOrders = await this.prisma.order.count({
      where: {
        status: {
          notIn: ['CANCELLED'],
        },
      },
    });

    console.log('Total commandes (non annulées):', totalOrders);

    // Commandes du mois en cours
    const ordersThisMonth = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
    });

    console.log('Commandes ce mois:', ordersThisMonth);

    // Commandes du mois dernier
    const ordersLastMonth = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
    });

    console.log('Commandes mois dernier:', ordersLastMonth);

    // Calcul du pourcentage de croissance des commandes
    const ordersGrowthPercent = ordersLastMonth > 0
      ? Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100)
      : ordersThisMonth > 0 ? 100 : 0;

    // Total des produits
    const totalProducts = await this.prisma.product.count();
    console.log('Total produits:', totalProducts);

    // Total des clients
    const totalCustomers = await this.prisma.user.count({
      where: {
        role: 'CUSTOMER',
      },
    });
    console.log('Total clients:', totalCustomers);

    // Clients du mois en cours
    const customersThisMonth = await this.prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: {
          gte: startOfMonth,
        },
      },
    });
    console.log('Clients ce mois:', customersThisMonth);

    // Clients du mois dernier
    const customersLastMonth = await this.prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });
    console.log('Clients mois dernier:', customersLastMonth);

    // Calcul du pourcentage de croissance des clients
    const customersGrowthPercent = customersLastMonth > 0
      ? Math.round(((customersThisMonth - customersLastMonth) / customersLastMonth) * 100)
      : customersThisMonth > 0 ? 100 : 0;

    // Promotions actives (dont la date de fin est dans le futur et la date de début est dans le passé ou aujourd'hui)
    const activePromotions = await this.prisma.promotion.count({
      where: {
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
        isActive: true,
      },
    });
    console.log('Promotions actives:', activePromotions);

    const stats = {
      orders: {
        total: totalOrders,
        thisMonth: ordersThisMonth,
        growthPercent: ordersGrowthPercent,
      },
      products: {
        total: totalProducts,
      },
      customers: {
        total: totalCustomers,
        thisMonth: customersThisMonth,
        growthPercent: customersGrowthPercent,
      },
      promotions: {
        active: activePromotions,
      },
    };

    console.log('Statistiques du tableau de bord calculées:', stats);
    return stats;
  }

  async remove(id: number) {
    // Vérifier si la commande existe
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            payment: true,
          },
        },
        quote: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Commande avec l'ID ${id} introuvable`);
    }

    // Vérifier que la commande est annulée
    if (order.status !== 'CANCELLED') {
      throw new BadRequestException(
        'Impossible de supprimer une commande qui n\'est pas annulée',
      );
    }

    // Vérifier qu'il n'y a pas de paiement complété
    if (order.invoice?.payment?.status === 'COMPLETED') {
      throw new BadRequestException(
        'Impossible de supprimer une commande avec un paiement complété',
      );
    }

    console.log(`Suppression de la commande #${id} (annulée)`);

    // Supprimer la commande (les relations seront supprimées automatiquement grâce à onDelete: Cascade)
    // - OrderItem sera supprimé (onDelete: Cascade)
    // - Invoice sera supprimé si existe (relation 1-1)
    // - Quote sera supprimé si existe (relation 1-1)
    const deletedOrder = await this.prisma.order.delete({
      where: { id },
    });

    console.log(`Commande #${id} supprimée avec succès`);
    return deletedOrder;
  }
}
