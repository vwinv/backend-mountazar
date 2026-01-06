"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametrageModule = void 0;
const common_1 = require("@nestjs/common");
const parametrage_service_1 = require("./parametrage.service");
const parametrage_controller_1 = require("./parametrage.controller");
const prisma_service_1 = require("../prisma/prisma.service");
let ParametrageModule = class ParametrageModule {
};
exports.ParametrageModule = ParametrageModule;
exports.ParametrageModule = ParametrageModule = __decorate([
    (0, common_1.Module)({
        controllers: [parametrage_controller_1.ParametrageController],
        providers: [parametrage_service_1.ParametrageService, prisma_service_1.PrismaService],
    })
], ParametrageModule);
//# sourceMappingURL=parametrage.module.js.map