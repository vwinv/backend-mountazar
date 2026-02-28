"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametrageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ParametrageService = class ParametrageService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCurrent() {
        const existing = await this.prisma.parametrage.findFirst({
            orderBy: { id: 'asc' },
        });
        if (!existing) {
            return this.prisma.parametrage.create({
                data: {
                    siteTitle: 'Mountazar',
                    isActive: true,
                },
            });
        }
        return existing;
    }
    async update(data) {
        const current = await this.getCurrent();
        const id = current.id;
        const contactFields = [];
        const d = data;
        const contactKeys = [
            'contactEmail', 'contactPhone', 'contactPhoneMobile', 'contactPhoneFax', 'contactWhatsapp',
            'address', 'facebookUrl', 'instagramUrl', 'twitterUrl', 'tiktokUrl',
        ];
        for (const key of contactKeys) {
            const v = d[key];
            if (v !== undefined && v !== null) {
                contactFields.push({ col: `"${key}"`, val: String(v) });
            }
        }
        if (contactFields.length > 0) {
            const sets = contactFields.map((f, i) => `${f.col} = $${i + 1}`).join(', ');
            const params = [...contactFields.map(f => f.val), id];
            await this.prisma.$executeRawUnsafe(`UPDATE "Parametrage" SET ${sets}, "updatedAt" = NOW() WHERE id = $${params.length}`, ...params);
        }
        const updateData = {};
        if (data.heroBackgrounds !== undefined)
            updateData.heroBackgrounds = data.heroBackgrounds;
        if (data.galleryImages !== undefined)
            updateData.galleryImages = data.galleryImages;
        if (data.values !== undefined)
            updateData.values = data.values;
        const otherKeys = [
            'siteTitle', 'siteSubtitle', 'logoUrl', 'heroTitle', 'heroSubtitle',
            'aboutTitle', 'aboutContent', 'valuesTitle', 'valuesContent',
            'isActive',
        ];
        for (const key of otherKeys) {
            const v = data[key];
            if (v !== undefined && v !== null)
                updateData[key] = v;
        }
        if (Object.keys(updateData).length > 0) {
            return this.prisma.parametrage.update({
                where: { id },
                data: updateData,
            });
        }
        return this.getCurrent();
    }
};
exports.ParametrageService = ParametrageService;
exports.ParametrageService = ParametrageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ParametrageService);
//# sourceMappingURL=parametrage.service.js.map