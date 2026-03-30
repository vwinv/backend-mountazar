import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/payments')
export class PaymentsController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {
    console.log('PaymentsController initialized');
  }

  /**
   * Paiement via Wave Sénégal
   */
  @Post('wave-sn')
  @UseGuards(JwtAuthGuard)
  async payWithWaveSN(@Body() createPaymentDto: CreatePaymentDto, @CurrentUser() user: any) {
    try {
      console.log('payWithWaveSN called with:', {
        orderId: createPaymentDto.orderId,
        phoneNumber: createPaymentDto.phoneNumber,
        userId: user?.id
      });

      await this.verifyOrderOwnership(createPaymentDto.orderId, user.id);
      return await this.paymentService.payWithWaveSN(createPaymentDto);
    } catch (error) {
      console.error('Error in payWithWaveSN:', error);
      throw error;
    }
  }

  /**
   * Paiement via Orange Money Sénégal
   */
  @Post('orange-money-sn')
  @UseGuards(JwtAuthGuard)
  async payWithOrangeMoneySN(@Body() createPaymentDto: CreatePaymentDto, @CurrentUser() user: any) {
    await this.verifyOrderOwnership(createPaymentDto.orderId, user.id);
    return this.paymentService.payWithOrangeMoneySN(createPaymentDto);
  }

  /**
   * Webhook Samir Pay (URL à configurer côté tableau Samir / support).
   */
  @Post('callback')
  async handleCallback(@Body() data: any) {
    return this.paymentService.handleCallback(data);
  }

  /**
   * Vérifie que la commande appartient à l'utilisateur
   */
  private async verifyOrderOwnership(orderId: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException(`Commande avec l'ID ${orderId} introuvable`);
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Cette commande ne vous appartient pas');
    }
  }
}

