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
exports.RefreshToken = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let RefreshToken = class RefreshToken {
    constructor() {
        this.token = '';
        this.expiresAt = new Date();
        this.isRevoked = false;
        this.revokedAt = null;
        this.revokedByIp = null;
        this.replacedByToken = null;
        this.createdByIp = '';
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    get isExpired() {
        return this.expiresAt < new Date();
    }
    get isActive() {
        return !this.isRevoked && !this.isExpired;
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RefreshToken.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    (0, typeorm_1.Index)({ unique: true }),
    __metadata("design:type", String)
], RefreshToken.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], RefreshToken.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], RefreshToken.prototype, "isRevoked", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], RefreshToken.prototype, "revokedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 45, nullable: true }),
    __metadata("design:type", Object)
], RefreshToken.prototype, "revokedByIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], RefreshToken.prototype, "replacedByToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 45 }),
    __metadata("design:type", String)
], RefreshToken.prototype, "createdByIp", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RefreshToken.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RefreshToken.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.refreshTokens, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_1.User)
], RefreshToken.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RefreshToken.prototype, "userId", void 0);
RefreshToken = __decorate([
    (0, typeorm_1.Entity)('refresh_tokens')
], RefreshToken);
exports.RefreshToken = RefreshToken;
