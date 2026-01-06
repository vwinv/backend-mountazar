import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createOrUpdateRating(userId: number, productId: number, rating: number): Promise<any>;
    updateComment(userId: number, productId: number, comment: string | null): Promise<any>;
    create(userId: number, productId: number, createReviewDto: CreateReviewDto): Promise<any>;
    findAllApprovedByProduct(productId: number): Promise<any>;
    findUserReview(userId: number, productId: number): Promise<any>;
    findAll(): Promise<any>;
    approveReview(id: number): Promise<any>;
    deleteReview(id: number): Promise<any>;
}
