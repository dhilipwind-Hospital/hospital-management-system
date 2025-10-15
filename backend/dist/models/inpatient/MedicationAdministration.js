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
exports.MedicationAdministration = void 0;
const typeorm_1 = require("typeorm");
const Admission_1 = require("./Admission");
const User_1 = require("../User");
let MedicationAdministration = class MedicationAdministration {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MedicationAdministration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Admission_1.Admission, admission => admission.medications),
    (0, typeorm_1.JoinColumn)({ name: 'admission_id' }),
    __metadata("design:type", Admission_1.Admission)
], MedicationAdministration.prototype, "admission", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admission_id', type: 'uuid' }),
    __metadata("design:type", String)
], MedicationAdministration.prototype, "admissionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'administered_by' }),
    __metadata("design:type", User_1.User)
], MedicationAdministration.prototype, "administeredBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'administered_by', type: 'uuid' }),
    __metadata("design:type", String)
], MedicationAdministration.prototype, "administeredById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], MedicationAdministration.prototype, "administeredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MedicationAdministration.prototype, "medication", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MedicationAdministration.prototype, "dosage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MedicationAdministration.prototype, "route", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicationAdministration.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MedicationAdministration.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MedicationAdministration.prototype, "updatedAt", void 0);
MedicationAdministration = __decorate([
    (0, typeorm_1.Entity)('medication_administrations')
], MedicationAdministration);
exports.MedicationAdministration = MedicationAdministration;
