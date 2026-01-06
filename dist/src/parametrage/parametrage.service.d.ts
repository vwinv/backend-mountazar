import { PrismaService } from '../prisma/prisma.service';
import { UpdateParametrageDto } from './dto/update-parametrage.dto';
export declare class ParametrageService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCurrent(): Promise<{
        id: number;
        siteTitle: string;
        siteSubtitle: string | null;
        logoUrl: string | null;
        heroTitle: string | null;
        heroSubtitle: string | null;
        heroBackgrounds: import(".prisma/client").Prisma.JsonValue | null;
        aboutTitle: string | null;
        aboutContent: string | null;
        valuesTitle: string | null;
        valuesContent: string | null;
        values: import(".prisma/client").Prisma.JsonValue | null;
        galleryImages: import(".prisma/client").Prisma.JsonValue | null;
        contactEmail: string | null;
        contactPhone: string | null;
        address: string | null;
        facebookUrl: string | null;
        instagramUrl: string | null;
        twitterUrl: string | null;
        tiktokUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(data: UpdateParametrageDto & {
        heroBackgrounds?: string[];
        galleryImages?: string[];
        values?: {
            title: string;
            content: string;
        }[];
    }): Promise<{
        id: number;
        siteTitle: string;
        siteSubtitle: string | null;
        logoUrl: string | null;
        heroTitle: string | null;
        heroSubtitle: string | null;
        heroBackgrounds: import(".prisma/client").Prisma.JsonValue | null;
        aboutTitle: string | null;
        aboutContent: string | null;
        valuesTitle: string | null;
        valuesContent: string | null;
        values: import(".prisma/client").Prisma.JsonValue | null;
        galleryImages: import(".prisma/client").Prisma.JsonValue | null;
        contactEmail: string | null;
        contactPhone: string | null;
        address: string | null;
        facebookUrl: string | null;
        instagramUrl: string | null;
        twitterUrl: string | null;
        tiktokUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
