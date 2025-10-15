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
exports.Policy = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Plan_1 = require("./Plan");
let Policy = class Policy {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Policy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], Policy.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], Policy.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Plan_1.Plan, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'plan_id' }),
    __metadata("design:type", Plan_1.Plan)
], Policy.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plan_id', type: 'uuid' }),
    __metadata("design:type", String)
], Policy.prototype, "planId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'monthly' }),
    __metadata("design:type", String)
], Policy.prototype, "billingCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'active' }),
    __metadata("design:type", String)
], Policy.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Policy.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Policy.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Policy.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Policy.prototype, "updatedAt", void 0);
Policy = __decorate([
    (0, typeorm_1.Entity)('policies')
], Policy);
exports.Policy = Policy;
