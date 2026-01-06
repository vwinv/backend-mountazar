import {
  Controller,
  Post,
  Body,
  UseGuards,
  ParseIntPipe,
  Param,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { PayDunyaService } from './paydunya.service';
import { CreatePaymentDto, PayDunyaPaymentMethod } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/payments')
export class PaymentsController {
  constructor(
    private readonly payDunyaService: PayDunyaService,
    private readonly prisma: PrismaService,
  ) {
    console.log('PaymentsController initialized');
  }

  /**
   * Crée un checkout invoice PayDunya
   */
  @Post('checkout/:orderId')
  @UseGuards(JwtAuthGuard)
  async createCheckout(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.payDunyaService.createCheckoutInvoice(orderId);
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
      return await this.payDunyaService.payWithWaveSN(createPaymentDto);
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
    return this.payDunyaService.payWithOrangeMoneySN(createPaymentDto);
  }

  /**
   * Route de test pour vérifier que le module est chargé
   */
  @Get('test')
  test() {
    return { message: 'Payment module is working', timestamp: new Date().toISOString() };
  }

  /**
   * Route de test POST pour vérifier que les routes POST fonctionnent
   */
  @Post('test')
  testPost(@Body() body: any) {
    return { message: 'POST route is working', body, timestamp: new Date().toISOString() };
  }

  /**
   * Callback PayDunya (webhook)
   */
  @Post('callback')
  async handleCallback(@Body() data: any) {
    return this.payDunyaService.handleCallback(data);
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

