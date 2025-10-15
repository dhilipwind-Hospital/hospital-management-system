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
exports.Feedback = exports.FeedbackStatus = exports.FeedbackType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var FeedbackType;
(function (FeedbackType) {
    FeedbackType["GENERAL"] = "general";
    FeedbackType["APPOINTMENT"] = "appointment";
    FeedbackType["DOCTOR"] = "doctor";
    FeedbackType["FACILITY"] = "facility";
    FeedbackType["STAFF"] = "staff";
    FeedbackType["SUGGESTION"] = "suggestion";
    FeedbackType["COMPLAINT"] = "complaint";
})(FeedbackType = exports.FeedbackType || (exports.FeedbackType = {}));
var FeedbackStatus;
(function (FeedbackStatus) {
    FeedbackStatus["PENDING"] = "pending";
    FeedbackStatus["REVIEWED"] = "reviewed";
    FeedbackStatus["RESOLVED"] = "resolved";
    FeedbackStatus["CLOSED"] = "closed";
})(FeedbackStatus = exports.FeedbackStatus || (exports.FeedbackStatus = {}));
let Feedback = class Feedback {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Feedback.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], Feedback.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FeedbackType
    }),
    __metadata("design:type", String)
], Feedback.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Feedback.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Feedback.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Feedback.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FeedbackStatus,
        default: FeedbackStatus.PENDING
    }),
    __metadata("design:type", String)
], Feedback.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Feedback.prototype, "response", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'responded_by' }),
    __metadata("design:type", User_1.User)
], Feedback.prototype, "respondedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Feedback.prototype, "respondedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Feedback.prototype, "createdAt", void 0);
Feedback = __decorate([
    (0, typeorm_1.Entity)({ name: 'feedback' })
], Feedback);
exports.Feedback = Feedback;
