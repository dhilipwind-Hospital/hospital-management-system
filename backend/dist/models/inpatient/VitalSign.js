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
exports.VitalSign = void 0;
const typeorm_1 = require("typeorm");
const Admission_1 = require("./Admission");
const User_1 = require("../User");
let VitalSign = class VitalSign {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VitalSign.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Admission_1.Admission, admission => admission.vitalSigns),
    (0, typeorm_1.JoinColumn)({ name: 'admission_id' }),
    __metadata("design:type", Admission_1.Admission)
], VitalSign.prototype, "admission", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admission_id', type: 'uuid' }),
    __metadata("design:type", String)
], VitalSign.prototype, "admissionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'recorded_by' }),
    __metadata("design:type", User_1.User)
], VitalSign.prototype, "recordedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recorded_by', type: 'uuid' }),
    __metadata("design:type", String)
], VitalSign.prototype, "recordedById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], VitalSign.prototype, "recordedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], VitalSign.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { nullable: true }),
    __metadata("design:type", Number)
], VitalSign.prototype, "heartRate", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { nullable: true }),
    __metadata("design:type", Number)
], VitalSign.prototype, "respiratoryRate", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { nullable: true }),
    __metadata("design:type", Number)
], VitalSign.prototype, "systolicBP", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { nullable: true }),
    __metadata("design:type", Number)
], VitalSign.prototype, "diastolicBP", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { nullable: true }),
    __metadata("design:type", Number)
], VitalSign.prototype, "oxygenSaturation", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], VitalSign.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], VitalSign.prototype, "painScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], VitalSign.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VitalSign.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VitalSign.prototype, "updatedAt", void 0);
VitalSign = __decorate([
    (0, typeorm_1.Entity)('vital_signs')
], VitalSign);
exports.VitalSign = VitalSign;
