import { Module } from '@nestjs/common';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { CustomerQuotesController } from './customer-quotes.controller';

@Module({
  imports: [AuthModule],
  controllers: [QuotesController, CustomerQuotesController],
  providers: [QuotesService, PrismaService],
  exports: [QuotesService],
})
export class QuotesModule {}

