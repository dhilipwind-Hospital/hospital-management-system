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
exports.EmergencyRequest = exports.EmergencyPriority = exports.EmergencyStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var EmergencyStatus;
(function (EmergencyStatus) {
    EmergencyStatus["PENDING"] = "pending";
    EmergencyStatus["IN_PROGRESS"] = "in_progress";
    EmergencyStatus["RESOLVED"] = "resolved";
    EmergencyStatus["CANCELLED"] = "cancelled";
})(EmergencyStatus = exports.EmergencyStatus || (exports.EmergencyStatus = {}));
var EmergencyPriority;
(function (EmergencyPriority) {
    EmergencyPriority["CRITICAL"] = "critical";
    EmergencyPriority["HIGH"] = "high";
    EmergencyPriority["MEDIUM"] = "medium";
    EmergencyPriority["LOW"] = "low";
})(EmergencyPriority = exports.EmergencyPriority || (exports.EmergencyPriority = {}));
let EmergencyRequest = class EmergencyRequest {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmergencyRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], EmergencyRequest.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 40 }),
    __metadata("design:type", String)
], EmergencyRequest.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], EmergencyRequest.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], EmergencyRequest.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EmergencyStatus,
        default: EmergencyStatus.PENDING
    }),
    __metadata("design:type", String)
], EmergencyRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EmergencyPriority,
        default: EmergencyPriority.MEDIUM
    }),
    __metadata("design:type", String)
], EmergencyRequest.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_to' }),
    __metadata("design:type", Object)
], EmergencyRequest.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], EmergencyRequest.prototype, "responseNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], EmergencyRequest.prototype, "respondedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EmergencyRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], EmergencyRequest.prototype, "updatedAt", void 0);
EmergencyRequest = __decorate([
    (0, typeorm_1.Entity)({ name: 'emergency_requests' })
], EmergencyRequest);
exports.EmergencyRequest = EmergencyRequest;
