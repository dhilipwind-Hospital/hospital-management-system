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
exports.AppointmentHistory = void 0;
const typeorm_1 = require("typeorm");
const Appointment_1 = require("./Appointment");
let AppointmentHistory = class AppointmentHistory {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AppointmentHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Appointment_1.Appointment, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'appointment_id' }),
    __metadata("design:type", Appointment_1.Appointment)
], AppointmentHistory.prototype, "appointment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'appointment_id', type: 'uuid' }),
    __metadata("design:type", String)
], AppointmentHistory.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], AppointmentHistory.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AppointmentHistory.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'changed_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AppointmentHistory.prototype, "changedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AppointmentHistory.prototype, "createdAt", void 0);
AppointmentHistory = __decorate([
    (0, typeorm_1.Entity)()
], AppointmentHistory);
exports.AppointmentHistory = AppointmentHistory;
