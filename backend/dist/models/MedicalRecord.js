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
exports.MedicalRecord = exports.RecordType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const class_validator_1 = require("class-validator");
var RecordType;
(function (RecordType) {
    RecordType["CONSULTATION"] = "consultation";
    RecordType["LAB_REPORT"] = "lab_report";
    RecordType["PRESCRIPTION"] = "prescription";
    RecordType["DISCHARGE_SUMMARY"] = "discharge_summary";
    RecordType["IMAGING"] = "imaging";
})(RecordType = exports.RecordType || (exports.RecordType = {}));
let MedicalRecord = class MedicalRecord {
    constructor() {
        this.type = RecordType.CONSULTATION;
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MedicalRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", User_1.User)
], MedicalRecord.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'doctor_id' }),
    __metadata("design:type", User_1.User)
], MedicalRecord.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RecordType,
        default: RecordType.CONSULTATION
    }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicalRecord.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicalRecord.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicalRecord.prototype, "diagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicalRecord.prototype, "treatment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicalRecord.prototype, "medications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicalRecord.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], MedicalRecord.prototype, "recordDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MedicalRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MedicalRecord.prototype, "updatedAt", void 0);
MedicalRecord = __decorate([
    (0, typeorm_1.Entity)('medical_records')
], MedicalRecord);
exports.MedicalRecord = MedicalRecord;
