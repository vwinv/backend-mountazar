import { Module } from '@nestjs/common';
import { ParametrageService } from './parametrage.service';
import { ParametrageController } from './parametrage.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ParametrageController],
  providers: [ParametrageService, PrismaService],
})
export class ParametrageModule {}


