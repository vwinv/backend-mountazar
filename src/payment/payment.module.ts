import { Module } from '@nestjs/common';
import { PayDunyaService } from './paydunya.service';
import { PaymentsController } from './payment.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PaymentsController],
  providers: [PayDunyaService, PrismaService],
  exports: [PayDunyaService],
})
export class PaymentModule {}

