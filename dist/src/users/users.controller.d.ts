import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(search?: string): Promise<{
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
