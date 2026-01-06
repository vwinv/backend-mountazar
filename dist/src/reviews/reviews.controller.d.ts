import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(createReviewDto: CreateReviewDto, user: any): Promise<any>;
    createOrUpdateRating(body: {
        productId: number;
        rating: number;
    }, user: any): Promise<any>;
    updateComment(body: {
        productId: number;
        comment: string | null;
    }, user: any): Promise<any>;
    findAllApprovedByProduct(productId: number): Promise<any>;
    findUserReview(productId: number, user: any): Promise<any>;
}
