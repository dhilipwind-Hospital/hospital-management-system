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
exports.DischargeSummary = void 0;
const typeorm_1 = require("typeorm");
const Admission_1 = require("./Admission");
const User_1 = require("../User");
let DischargeSummary = class DischargeSummary {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DischargeSummary.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Admission_1.Admission, admission => admission.dischargeSummary),
    (0, typeorm_1.JoinColumn)({ name: 'admission_id' }),
    __metadata("design:type", Admission_1.Admission)
], DischargeSummary.prototype, "admission", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admission_id', type: 'uuid' }),
    __metadata("design:type", String)
], DischargeSummary.prototype, "admissionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'doctor_id' }),
    __metadata("design:type", User_1.User)
], DischargeSummary.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'doctor_id', type: 'uuid' }),
    __metadata("design:type", String)
], DischargeSummary.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], DischargeSummary.prototype, "dischargeDateTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DischargeSummary.prototype, "admissionDiagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DischargeSummary.prototype, "dischargeDiagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DischargeSummary.prototype, "briefSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DischargeSummary.prototype, "treatmentGiven", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DischargeSummary.prototype, "conditionAtDischarge", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DischargeSummary.prototype, "followUpInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DischargeSummary.prototype, "medicationsAtDischarge", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DischargeSummary.prototype, "dietaryInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DischargeSummary.prototype, "activityInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DischargeSummary.prototype, "specialInstructions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DischargeSummary.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DischargeSummary.prototype, "updatedAt", void 0);
DischargeSummary = __decorate([
    (0, typeorm_1.Entity)('discharge_summaries')
], DischargeSummary);
exports.DischargeSummary = DischargeSummary;
