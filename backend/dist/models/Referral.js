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
exports.Referral = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Department_1 = require("./Department");
let Referral = class Referral {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Referral.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", User_1.User)
], Referral.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], Referral.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Department_1.Department, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'department_id' }),
    __metadata("design:type", Department_1.Department)
], Referral.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department_id', type: 'uuid' }),
    __metadata("design:type", String)
], Referral.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Referral.prototype, "createdAt", void 0);
Referral = __decorate([
    (0, typeorm_1.Entity)('referrals')
], Referral);
exports.Referral = Referral;
