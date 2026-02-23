import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/customer/quotes')
@UseGuards(JwtAuthGuard)
export class CustomerQuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  /**
   * Liste des devis du client connecté.
   */
  @Get()
  async findMyQuotes(@CurrentUser() user: any) {
    return this.quotesService.findAllForCustomer(user.id);
  }

  /**
   * Acceptation d'un devis par le client.
   * Met le devis au statut APPROVED (accepté) si il lui appartient.
   */
  @Post(':id/accept')
  async acceptQuote(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const quote = await this.quotesService.findOne(id);

    if (!quote.order || quote.order.user.id !== user.id) {
      throw new ForbiddenException('Ce devis ne vous appartient pas');
    }

    // On réutilise la logique d’approbation du devis
    return this.quotesService.approve(id, user.id);
  }
}

