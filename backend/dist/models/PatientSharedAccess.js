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
exports.PatientSharedAccess = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const PatientAccessRequest_1 = require("./PatientAccessRequest");
let PatientSharedAccess = class PatientSharedAccess {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PatientSharedAccess.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], PatientSharedAccess.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", User_1.User)
], PatientSharedAccess.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'doctor_id', type: 'uuid' }),
    __metadata("design:type", String)
], PatientSharedAccess.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'doctor_id' }),
    __metadata("design:type", User_1.User)
], PatientSharedAccess.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'access_request_id', type: 'uuid' }),
    __metadata("design:type", String)
], PatientSharedAccess.prototype, "accessRequestId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PatientAccessRequest_1.PatientAccessRequest),
    (0, typeorm_1.JoinColumn)({ name: 'access_request_id' }),
    __metadata("design:type", PatientAccessRequest_1.PatientAccessRequest)
], PatientSharedAccess.prototype, "accessRequest", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'granted_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], PatientSharedAccess.prototype, "grantedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], PatientSharedAccess.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PatientSharedAccess.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PatientSharedAccess.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PatientSharedAccess.prototype, "updatedAt", void 0);
PatientSharedAccess = __decorate([
    (0, typeorm_1.Entity)('patient_shared_access')
], PatientSharedAccess);
exports.PatientSharedAccess = PatientSharedAccess;
