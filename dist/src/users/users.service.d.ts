import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllCustomers(search?: string): Promise<{
        id: number;
        email: string | null;
        firstName: string;
        lastName: string;
        createdAt: Date;
        _count: {
            orders: number;
        };
    }[]>;
}
