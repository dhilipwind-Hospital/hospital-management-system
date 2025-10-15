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
exports.Diagnosis = exports.DiagnosisSeverity = exports.DiagnosisStatus = exports.DiagnosisType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const ConsultationNote_1 = require("./ConsultationNote");
var DiagnosisType;
(function (DiagnosisType) {
    DiagnosisType["PRIMARY"] = "primary";
    DiagnosisType["SECONDARY"] = "secondary";
})(DiagnosisType = exports.DiagnosisType || (exports.DiagnosisType = {}));
var DiagnosisStatus;
(function (DiagnosisStatus) {
    DiagnosisStatus["PROVISIONAL"] = "provisional";
    DiagnosisStatus["CONFIRMED"] = "confirmed";
    DiagnosisStatus["RULED_OUT"] = "ruled_out";
})(DiagnosisStatus = exports.DiagnosisStatus || (exports.DiagnosisStatus = {}));
var DiagnosisSeverity;
(function (DiagnosisSeverity) {
    DiagnosisSeverity["MILD"] = "mild";
    DiagnosisSeverity["MODERATE"] = "moderate";
    DiagnosisSeverity["SEVERE"] = "severe";
})(DiagnosisSeverity = exports.DiagnosisSeverity || (exports.DiagnosisSeverity = {}));
let Diagnosis = class Diagnosis {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Diagnosis.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ConsultationNote_1.ConsultationNote, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'consultation_id' }),
    __metadata("design:type", ConsultationNote_1.ConsultationNote)
], Diagnosis.prototype, "consultation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", User_1.User)
], Diagnosis.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], Diagnosis.prototype, "icd10Code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Diagnosis.prototype, "diagnosisName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DiagnosisType,
        default: DiagnosisType.PRIMARY
    }),
    __metadata("design:type", String)
], Diagnosis.prototype, "diagnosisType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DiagnosisStatus,
        default: DiagnosisStatus.PROVISIONAL
    }),
    __metadata("design:type", String)
], Diagnosis.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DiagnosisSeverity,
        nullable: true
    }),
    __metadata("design:type", String)
], Diagnosis.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Diagnosis.prototype, "onsetDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Diagnosis.prototype, "resolvedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Diagnosis.prototype, "isChronic", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Diagnosis.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'diagnosed_by' }),
    __metadata("design:type", User_1.User)
], Diagnosis.prototype, "diagnosedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Diagnosis.prototype, "createdAt", void 0);
Diagnosis = __decorate([
    (0, typeorm_1.Entity)({ name: 'diagnoses' })
], Diagnosis);
exports.Diagnosis = Diagnosis;
