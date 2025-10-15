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
exports.PatientAccessAudit = exports.AuditAction = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var AuditAction;
(function (AuditAction) {
    AuditAction["REQUEST_CREATED"] = "request_created";
    AuditAction["REQUEST_APPROVED"] = "request_approved";
    AuditAction["REQUEST_REJECTED"] = "request_rejected";
    AuditAction["ACCESS_GRANTED"] = "access_granted";
    AuditAction["ACCESS_EXPIRED"] = "access_expired";
    AuditAction["ACCESS_REVOKED"] = "access_revoked";
    AuditAction["RECORD_VIEWED"] = "record_viewed";
    AuditAction["PRESCRIPTION_VIEWED"] = "prescription_viewed";
    AuditAction["APPOINTMENT_VIEWED"] = "appointment_viewed";
})(AuditAction = exports.AuditAction || (exports.AuditAction = {}));
let PatientAccessAudit = class PatientAccessAudit {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PatientAccessAudit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], PatientAccessAudit.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", User_1.User)
], PatientAccessAudit.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'doctor_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PatientAccessAudit.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'doctor_id' }),
    __metadata("design:type", User_1.User)
], PatientAccessAudit.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], PatientAccessAudit.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PatientAccessAudit.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', type: 'varchar', length: 45, nullable: true }),
    __metadata("design:type", String)
], PatientAccessAudit.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PatientAccessAudit.prototype, "createdAt", void 0);
PatientAccessAudit = __decorate([
    (0, typeorm_1.Entity)('patient_access_audit')
], PatientAccessAudit);
exports.PatientAccessAudit = PatientAccessAudit;
