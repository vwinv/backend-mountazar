import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(emailOrPhone: string, password: string, requireAdmin: boolean = false) {
    // Déterminer si c'est un email ou un téléphone
    const isEmail = emailOrPhone.includes('@');
    
    let user;
    if (isEmail) {
      // Rechercher par email
      user = await this.prisma.user.findUnique({
        where: { email: emailOrPhone },
      });
    } else {
      // Rechercher par téléphone
      user = await (this.prisma.user as any).findFirst({
        where: { phone: emailOrPhone },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Email/Téléphone ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email/Téléphone ou mot de passe incorrect');
    }

    // Vérifier que l'utilisateur est admin si requis
    if (requireAdmin && user.role !== 'ADMIN') {
      throw new UnauthorizedException('Accès refusé. Seuls les administrateurs peuvent accéder à cette section.');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto, requireAdmin: boolean = false) {
    const user = await this.validateUser(loginDto.emailOrPhone, loginDto.password, requireAdmin);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async adminLogin(adminLoginDto: AdminLoginDto) {
    // Pour l'admin, on utilise uniquement l'email
    const user = await this.validateUser(adminLoginDto.email, adminLoginDto.password, true);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Vérifier si l'email existe déjà (si fourni)
    if (registerDto.email && registerDto.email.trim().length > 0) {
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUserByEmail) {
        throw new BadRequestException('Cet email est déjà utilisé');
      }
    }

    // Vérifier si le téléphone existe déjà
    const existingUserByPhone = await (this.prisma.user as any).findFirst({
      where: { phone: registerDto.phone },
    });

    if (existingUserByPhone) {
      throw new BadRequestException('Ce numéro de téléphone est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Créer l'utilisateur avec le rôle CUSTOMER
    const user = await (this.prisma.user as any).create({
      data: {
        email: registerDto.email ?? null,
        phone: registerDto.phone,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: 'CUSTOMER',
      },
    });

    // Générer le token JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}

