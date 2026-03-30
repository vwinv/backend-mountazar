import {
  IsInt,
  IsString,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @IsInt()
  @Type(() => Number)
  orderId: number;

  // paymentMethod n'est plus nécessaire car on utilise des endpoints séparés
  // @IsEnum(PayDunyaPaymentMethod)
  // paymentMethod: PayDunyaPaymentMethod;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  otpCode?: string; // Pour Orange Money Burkina Faso
}

