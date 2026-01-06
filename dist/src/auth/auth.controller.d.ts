import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    adminLogin(adminLoginDto: AdminLoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
        };
    }>;
    customerLogin(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
        };
    }>;
    customerRegister(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
        };
    }>;
    getAdminProfile(user: any): Promise<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        role: any;
    }>;
    getCustomerProfile(user: any): Promise<{
        id: any;
        email: any;
        phone: any;
        firstName: any;
        lastName: any;
        role: any;
    }>;
}
