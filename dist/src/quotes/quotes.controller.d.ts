import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
export declare class QuotesController {
    private readonly quotesService;
    constructor(quotesService: QuotesService);
    create(createQuoteDto: CreateQuoteDto, user: any): Promise<any>;
    findAll(status?: string): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, updateQuoteDto: UpdateQuoteDto): Promise<any>;
    approve(id: number, user: any): Promise<any>;
    reject(id: number): Promise<any>;
    remove(id: number): Promise<any>;
}
