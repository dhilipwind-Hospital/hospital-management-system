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
exports.Plan = void 0;
const typeorm_1 = require("typeorm");
let Plan = class Plan {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Plan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Plan.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Plan.prototype, "insurer", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Standard' }),
    __metadata("design:type", String)
], Plan.prototype, "coverageLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Plan.prototype, "priceMonthly", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '12 weeks' }),
    __metadata("design:type", String)
], Plan.prototype, "waitingPeriod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'[]'" }),
    __metadata("design:type", Array)
], Plan.prototype, "benefits", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2, default: 'IE' }),
    __metadata("design:type", String)
], Plan.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'active' }),
    __metadata("design:type", String)
], Plan.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Plan.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Plan.prototype, "updatedAt", void 0);
Plan = __decorate([
    (0, typeorm_1.Entity)('plans')
], Plan);
exports.Plan = Plan;
