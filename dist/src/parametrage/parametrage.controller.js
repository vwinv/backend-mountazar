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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametrageController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const parametrage_service_1 = require("./parametrage.service");
let ParametrageController = class ParametrageController {
    parametrageService;
    constructor(parametrageService) {
        this.parametrageService = parametrageService;
    }
    async getPublicHero() {
        const current = await this.parametrageService.getCurrent();
        return {
            siteTitle: current.siteTitle,
            siteSubtitle: current.siteSubtitle,
            heroTitle: current.heroTitle,
            heroSubtitle: current.heroSubtitle,
            heroBackgrounds: current.heroBackgrounds ?? [],
        };
    }
    async getPublicFooter() {
        const current = await this.parametrageService.getCurrent();
        return {
            siteTitle: current.siteTitle,
            contactEmail: current.contactEmail,
            contactPhone: current.contactPhone,
            facebookUrl: current.facebookUrl,
            instagramUrl: current.instagramUrl,
            twitterUrl: current.twitterUrl,
            tiktokUrl: current.tiktokUrl,
        };
    }
    async getPublicAbout() {
        const current = await this.parametrageService.getCurrent();
        return {
            aboutTitle: current.aboutTitle,
            aboutContent: current.aboutContent,
            valuesTitle: current.valuesTitle,
            values: current.values ?? [],
            galleryImages: current.galleryImages ?? [],
        };
    }
    async getCurrent() {
        return this.parametrageService.getCurrent();
    }
    async update(body) {
        const dto = {
            ...body,
            heroBackgrounds: body.heroBackgrounds,
            galleryImages: body.galleryImages,
            values: body.values,
        };
        return this.parametrageService.update(dto);
    }
};
exports.ParametrageController = ParametrageController;
__decorate([
    (0, common_1.Get)('public/hero'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ParametrageController.prototype, "getPublicHero", null);
__decorate([
    (0, common_1.Get)('public/footer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ParametrageController.prototype, "getPublicFooter", null);
__decorate([
    (0, common_1.Get)('public/about'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ParametrageController.prototype, "getPublicAbout", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ParametrageController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Put)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParametrageController.prototype, "update", null);
exports.ParametrageController = ParametrageController = __decorate([
    (0, common_1.Controller)('api/parametrage'),
    __metadata("design:paramtypes", [parametrage_service_1.ParametrageService])
], ParametrageController);
//# sourceMappingURL=parametrage.controller.js.map