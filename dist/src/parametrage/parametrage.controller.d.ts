import { ParametrageService } from './parametrage.service';
export declare class ParametrageController {
    private readonly parametrageService;
    constructor(parametrageService: ParametrageService);
    getPublicHero(): Promise<{
        siteTitle: string;
        siteSubtitle: string | null;
        heroTitle: string | null;
        heroSubtitle: string | null;
        heroBackgrounds: string[];
    }>;
    getPublicFooter(): Promise<{
        siteTitle: string;
        contactEmail: string | null;
        contactPhone: string | null;
        facebookUrl: string | null;
        instagramUrl: string | null;
        twitterUrl: string | null;
        tiktokUrl: string | null;
    }>;
    getPublicAbout(): Promise<{
        aboutTitle: string | null;
        aboutContent: string | null;
        valuesTitle: string | null;
        values: {
            title: string;
            content: string;
        }[];
        galleryImages: string[];
    }>;
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
    update(body: any): Promise<{
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
