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
exports.Appointment = exports.AppointmentStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Service_1 = require("./Service");
const class_validator_1 = require("class-validator");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PENDING"] = "pending";
    AppointmentStatus["CONFIRMED"] = "confirmed";
    AppointmentStatus["CANCELLED"] = "cancelled";
    AppointmentStatus["COMPLETED"] = "completed";
    AppointmentStatus["NOSHOW"] = "no_show";
})(AppointmentStatus = exports.AppointmentStatus || (exports.AppointmentStatus = {}));
let Appointment = class Appointment {
    constructor() {
        this.status = AppointmentStatus.PENDING;
    }
    // Add any additional methods or validations here
    validateTiming() {
        return this.endTime > this.startTime;
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Appointment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.appointments),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", User_1.User)
], Appointment.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'doctor_id' }),
    __metadata("design:type", User_1.User)
], Appointment.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Service_1.Service, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'service_id' }),
    __metadata("design:type", Service_1.Service)
], Appointment.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], Appointment.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], Appointment.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.PENDING
    }),
    (0, class_validator_1.IsEnum)(AppointmentStatus),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Appointment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Appointment.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "consultationNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'cancelled_by' }),
    __metadata("design:type", Object)
], Appointment.prototype, "cancelledBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Appointment.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Appointment.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Appointment.prototype, "rescheduledFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Appointment.prototype, "rescheduledTo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Appointment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Appointment.prototype, "updatedAt", void 0);
Appointment = __decorate([
    (0, typeorm_1.Entity)('appointments')
], Appointment);
exports.Appointment = Appointment;
