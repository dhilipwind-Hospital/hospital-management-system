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
exports.CallbackRequest = exports.CallbackStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var CallbackStatus;
(function (CallbackStatus) {
    CallbackStatus["PENDING"] = "pending";
    CallbackStatus["CALLED"] = "called";
    CallbackStatus["COMPLETED"] = "completed";
    CallbackStatus["CANCELLED"] = "cancelled";
    CallbackStatus["NO_ANSWER"] = "no_answer";
})(CallbackStatus = exports.CallbackStatus || (exports.CallbackStatus = {}));
let CallbackRequest = class CallbackRequest {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CallbackRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], CallbackRequest.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 40 }),
    __metadata("design:type", String)
], CallbackRequest.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120, nullable: true }),
    __metadata("design:type", Object)
], CallbackRequest.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120, nullable: true }),
    __metadata("design:type", Object)
], CallbackRequest.prototype, "preferredTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CallbackRequest.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CallbackStatus,
        default: CallbackStatus.PENDING
    }),
    __metadata("design:type", String)
], CallbackRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_to' }),
    __metadata("design:type", Object)
], CallbackRequest.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CallbackRequest.prototype, "callNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], CallbackRequest.prototype, "callOutcome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], CallbackRequest.prototype, "calledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], CallbackRequest.prototype, "followUpDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CallbackRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CallbackRequest.prototype, "updatedAt", void 0);
CallbackRequest = __decorate([
    (0, typeorm_1.Entity)({ name: 'callback_requests' })
], CallbackRequest);
exports.CallbackRequest = CallbackRequest;
