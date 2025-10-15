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
exports.Prescription = exports.PrescriptionStatus = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const User_1 = require("../User");
const PrescriptionItem_1 = require("./PrescriptionItem");
var PrescriptionStatus;
(function (PrescriptionStatus) {
    PrescriptionStatus["PENDING"] = "pending";
    PrescriptionStatus["DISPENSED"] = "dispensed";
    PrescriptionStatus["PARTIALLY_DISPENSED"] = "partially_dispensed";
    PrescriptionStatus["CANCELLED"] = "cancelled";
})(PrescriptionStatus = exports.PrescriptionStatus || (exports.PrescriptionStatus = {}));
let Prescription = class Prescription {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Prescription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'doctor_id' }),
    __metadata("design:type", User_1.User)
], Prescription.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'doctor_id', type: 'uuid' }),
    __metadata("design:type", String)
], Prescription.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", User_1.User)
], Prescription.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], Prescription.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, class_validator_1.IsDate)({ message: 'Prescription date must be a valid date' }),
    __metadata("design:type", Date)
], Prescription.prototype, "prescriptionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Diagnosis must be a string' }),
    __metadata("design:type", String)
], Prescription.prototype, "diagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Notes must be a string' }),
    __metadata("design:type", String)
], Prescription.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PrescriptionStatus,
        default: PrescriptionStatus.PENDING
    }),
    (0, class_validator_1.IsEnum)(PrescriptionStatus, { message: 'Invalid prescription status' }),
    __metadata("design:type", String)
], Prescription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PrescriptionItem_1.PrescriptionItem, item => item.prescription, { cascade: true }),
    __metadata("design:type", Array)
], Prescription.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Prescription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Prescription.prototype, "updatedAt", void 0);
Prescription = __decorate([
    (0, typeorm_1.Entity)('prescriptions')
], Prescription);
exports.Prescription = Prescription;
