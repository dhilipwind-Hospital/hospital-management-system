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
exports.Notification = exports.NotificationPriority = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var NotificationType;
(function (NotificationType) {
    NotificationType["APPOINTMENT_NEW"] = "appointment_new";
    NotificationType["APPOINTMENT_CONFIRMED"] = "appointment_confirmed";
    NotificationType["APPOINTMENT_CANCELLED"] = "appointment_cancelled";
    NotificationType["APPOINTMENT_REMINDER"] = "appointment_reminder";
    NotificationType["APPOINTMENT_RESCHEDULED"] = "appointment_rescheduled";
    NotificationType["EMERGENCY_NEW"] = "emergency_new";
    NotificationType["EMERGENCY_ASSIGNED"] = "emergency_assigned";
    NotificationType["CALLBACK_NEW"] = "callback_new";
    NotificationType["CALLBACK_ASSIGNED"] = "callback_assigned";
    NotificationType["PRESCRIPTION_READY"] = "prescription_ready";
    NotificationType["PRESCRIPTION_NEW"] = "prescription_new";
    NotificationType["TEST_RESULT_READY"] = "test_result_ready";
    NotificationType["SYSTEM_ANNOUNCEMENT"] = "system_announcement";
    NotificationType["GENERAL"] = "general";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "low";
    NotificationPriority["MEDIUM"] = "medium";
    NotificationPriority["HIGH"] = "high";
    NotificationPriority["URGENT"] = "urgent";
})(NotificationPriority = exports.NotificationPriority || (exports.NotificationPriority = {}));
let Notification = class Notification {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], Notification.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationType
    }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationPriority,
        default: NotificationPriority.MEDIUM
    }),
    __metadata("design:type", String)
], Notification.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "actionUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "actionLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "emailSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "emailSentAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Notification.prototype, "updatedAt", void 0);
Notification = __decorate([
    (0, typeorm_1.Entity)({ name: 'notifications' })
], Notification);
exports.Notification = Notification;
