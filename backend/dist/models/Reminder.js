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
exports.Reminder = exports.ReminderStatus = exports.ReminderType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Appointment_1 = require("./Appointment");
var ReminderType;
(function (ReminderType) {
    ReminderType["APPOINTMENT"] = "appointment";
    ReminderType["MEDICATION"] = "medication";
    ReminderType["FOLLOWUP"] = "followup";
    ReminderType["LAB_RESULT"] = "lab_result";
    ReminderType["CUSTOM"] = "custom";
})(ReminderType = exports.ReminderType || (exports.ReminderType = {}));
var ReminderStatus;
(function (ReminderStatus) {
    ReminderStatus["PENDING"] = "pending";
    ReminderStatus["SENT"] = "sent";
    ReminderStatus["FAILED"] = "failed";
    ReminderStatus["CANCELLED"] = "cancelled";
})(ReminderStatus = exports.ReminderStatus || (exports.ReminderStatus = {}));
let Reminder = class Reminder {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Reminder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], Reminder.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReminderType
    }),
    __metadata("design:type", String)
], Reminder.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Reminder.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Reminder.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Reminder.prototype, "scheduledFor", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReminderStatus,
        default: ReminderStatus.PENDING
    }),
    __metadata("design:type", String)
], Reminder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Appointment_1.Appointment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'appointment_id' }),
    __metadata("design:type", Appointment_1.Appointment)
], Reminder.prototype, "appointment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Reminder.prototype, "medicationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Reminder.prototype, "sendEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Reminder.prototype, "sendSms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Reminder.prototype, "sendNotification", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Reminder.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Reminder.prototype, "createdAt", void 0);
Reminder = __decorate([
    (0, typeorm_1.Entity)({ name: 'reminders' })
], Reminder);
exports.Reminder = Reminder;
