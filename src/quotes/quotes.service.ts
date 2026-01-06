import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuoteDto: CreateQuoteDto) {
    // Vérifier que la commande existe et nécessite un devis
    const order = await this.prisma.order.findUnique({
      where: { id: createQuoteDto.orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    }) as any;

    if (!order) {
      throw new NotFoundException(`Commande avec l'ID ${createQuoteDto.orderId} introuvable`);
    }

    if (!order.requiresQuote) {
      throw new BadRequestException('Cette commande ne nécessite pas de devis');
    }

    // Vérifier qu'un devis n'existe pas déjà pour cette commande
    const existingQuote = await (this.prisma as any).quote.findUnique({
      where: { orderId: createQuoteDto.orderId },
    });

    if (existingQuote) {
      throw new BadRequestException('Un devis existe déjà pour cette commande');
    }

    // Créer le devis
    const quote = await (this.prisma as any).quote.create({
      data: {
        orderId: createQuoteDto.orderId,
        total: createQuoteDto.total,
        notes: createQuoteDto.notes || null,
        validUntil: createQuoteDto.validUntil ? new Date(createQuoteDto.validUntil) : null,
        approvedBy: createQuoteDto.approvedBy || null,
        quoteDetails: createQuoteDto.quoteDetails || null,
        status: 'PENDING',
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // Mettre à jour le statut de la commande
    await this.prisma.order.update({
      where: { id: createQuoteDto.orderId },
      data: { status: 'QUOTE_PENDING' as any },
    });

    return quote;
  }

  async findAll(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return (this.prisma as any).quote.findMany({
      where,
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const quote = await (this.prisma as any).quote.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
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
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException(`Devis avec l'ID ${id} introuvable`);
    }

    return quote;
  }

  async update(id: number, updateQuoteDto: UpdateQuoteDto) {
    const existing = await (this.prisma as any).quote.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Devis avec l'ID ${id} introuvable`);
    }

    const updateData: any = {};
    if (updateQuoteDto.total !== undefined) {
      updateData.total = updateQuoteDto.total;
    }
    if (updateQuoteDto.notes !== undefined) {
      updateData.notes = updateQuoteDto.notes || null;
    }
    if (updateQuoteDto.validUntil !== undefined) {
      updateData.validUntil = updateQuoteDto.validUntil ? new Date(updateQuoteDto.validUntil) : null;
    }
    if (updateQuoteDto.status !== undefined) {
      updateData.status = updateQuoteDto.status;
      
      // Mettre à jour le statut de la commande en fonction du statut du devis
      if (updateQuoteDto.status === 'APPROVED') {
        updateData.approvedAt = new Date();
        await this.prisma.order.update({
          where: { id: existing.orderId },
          data: { status: 'QUOTE_APPROVED' as any },
        });
      } else if (updateQuoteDto.status === 'REJECTED') {
        await this.prisma.order.update({
          where: { id: existing.orderId },
          data: { status: 'QUOTE_REJECTED' as any },
        });
      }
    }

    return (this.prisma as any).quote.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async approve(id: number, approvedBy: number) {
    const quote = await (this.prisma as any).quote.findUnique({
      where: { id },
    });

    if (!quote) {
      throw new NotFoundException(`Devis avec l'ID ${id} introuvable`);
    }

    if (quote.status === 'APPROVED') {
      throw new BadRequestException('Ce devis est déjà approuvé');
    }

    // Approuver le devis
    const updated = await (this.prisma as any).quote.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy,
      },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    // Mettre à jour le statut de la commande
    await this.prisma.order.update({
      where: { id: quote.orderId },
      data: { status: 'QUOTE_APPROVED' as any },
    });

    return updated;
  }

  async reject(id: number) {
    const quote = await (this.prisma as any).quote.findUnique({
      where: { id },
    });

    if (!quote) {
      throw new NotFoundException(`Devis avec l'ID ${id} introuvable`);
    }

    // Rejeter le devis
    const updated = await (this.prisma as any).quote.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    // Mettre à jour le statut de la commande
    await this.prisma.order.update({
      where: { id: quote.orderId },
      data: { status: 'QUOTE_REJECTED' as any },
    });

    return updated;
  }

  async remove(id: number) {
    // Vérifier si le devis existe
    const quote = await (this.prisma as any).quote.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            invoice: {
              include: {
                payment: true,
              },
            },
          },
        },
        invoice: true,
      },
    });

    if (!quote) {
      throw new NotFoundException(`Devis avec l'ID ${id} introuvable`);
    }

    // Vérifier qu'il n'y a pas de facture associée avec un paiement complété
    if (quote.invoice) {
      throw new BadRequestException(
        'Impossible de supprimer un devis associé à une facture',
      );
    }

    // Vérifier que la commande associée n'a pas de paiement complété
    if (quote.order?.invoice?.payment?.status === 'COMPLETED') {
      throw new BadRequestException(
        'Impossible de supprimer un devis dont la commande associée a un paiement complété',
      );
    }

    console.log(`Suppression du devis #${id}`);

    // Supprimer le devis (les relations seront supprimées automatiquement grâce à onDelete: Cascade)
    // - Invoice sera supprimé si existe (relation 1-1 avec onDelete: SetNull)
    const deletedQuote = await (this.prisma as any).quote.delete({
      where: { id },
    });

    console.log(`Devis #${id} supprimé avec succès`);
    return deletedQuote;
  }
}

