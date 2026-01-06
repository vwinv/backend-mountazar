import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Route publique pour les clients (demande de devis)
  @Post('customer')
  @UseGuards(JwtAuthGuard)
  createCustomerOrder(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
    // S'assurer que l'utilisateur est un client
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Cette route est réservée aux clients');
    }
    // Utiliser l'ID de l'utilisateur connecté
    createOrderDto.userId = user.id;
    return this.ordersService.create(createOrderDto);
  }

  // Route pour récupérer les commandes du client connecté
  @Get('customer')
  @UseGuards(JwtAuthGuard)
  getCustomerOrders(@CurrentUser() user: any) {
    // S'assurer que l'utilisateur est un client
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Cette route est réservée aux clients');
    }
    return this.ordersService.findByUserId(user.id);
  }

  // Routes admin (protégées)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query('status') status?: string, @Query('requiresQuote') requiresQuote?: string) {
    const requiresQuoteBool = requiresQuote === 'true' ? true : requiresQuote === 'false' ? false : undefined;
    return this.ordersService.findAll(status, requiresQuoteBool);
  }

  // Routes de statistiques (DOIVENT être avant @Get(':id') pour éviter les conflits)
  @Get('stats/monthly-sales')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getMonthlySalesStats(@Query('year') year?: string) {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.ordersService.getMonthlySalesStats(yearNumber);
  }

  @Get('stats/available-years')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAvailableYears() {
    return this.ordersService.getAvailableYears();
  }

  @Get('stats/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getDashboardStats() {
    return this.ordersService.getDashboardStats();
  }

  // Routes spécifiques avec sous-routes (DOIVENT être avant les routes :id génériques)
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancel(id);
  }

  @Post(':id/validate-payment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  validatePayment(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.validatePayment(id);
  }

  // Routes génériques avec :id
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }
}
