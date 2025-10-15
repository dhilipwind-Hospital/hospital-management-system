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
exports.PatientAccessRequest = exports.AccessRequestStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var AccessRequestStatus;
(function (AccessRequestStatus) {
    AccessRequestStatus["PENDING"] = "pending";
    AccessRequestStatus["APPROVED"] = "approved";
    AccessRequestStatus["REJECTED"] = "rejected";
    AccessRequestStatus["EXPIRED"] = "expired";
})(AccessRequestStatus = exports.AccessRequestStatus || (exports.AccessRequestStatus = {}));
let PatientAccessRequest = class PatientAccessRequest {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PatientAccessRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], PatientAccessRequest.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", User_1.User)
], PatientAccessRequest.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requesting_doctor_id', type: 'uuid' }),
    __metadata("design:type", String)
], PatientAccessRequest.prototype, "requestingDoctorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'requesting_doctor_id' }),
    __metadata("design:type", User_1.User)
], PatientAccessRequest.prototype, "requestingDoctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PatientAccessRequest.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_duration_hours', type: 'integer', default: 24 }),
    __metadata("design:type", Number)
], PatientAccessRequest.prototype, "requestedDurationHours", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        default: AccessRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], PatientAccessRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by_patient_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PatientAccessRequest.prototype, "approvedByPatientAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejected_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PatientAccessRequest.prototype, "rejectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejection_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatientAccessRequest.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PatientAccessRequest.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PatientAccessRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PatientAccessRequest.prototype, "updatedAt", void 0);
PatientAccessRequest = __decorate([
    (0, typeorm_1.Entity)('patient_access_requests')
], PatientAccessRequest);
exports.PatientAccessRequest = PatientAccessRequest;
