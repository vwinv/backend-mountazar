import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
export declare class QuotesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createQuoteDto: CreateQuoteDto): Promise<any>;
    findAll(status?: string): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, updateQuoteDto: UpdateQuoteDto): Promise<any>;
    approve(id: number, approvedBy: number): Promise<any>;
    reject(id: number): Promise<any>;
    remove(id: number): Promise<any>;
}
