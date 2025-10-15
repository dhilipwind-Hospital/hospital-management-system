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
exports.LabSample = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let LabSample = class LabSample {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LabSample.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], LabSample.prototype, "sampleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], LabSample.prototype, "sampleType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], LabSample.prototype, "collectionTime", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'collected_by' }),
    __metadata("design:type", User_1.User)
], LabSample.prototype, "collectedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'collected_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], LabSample.prototype, "collectedById", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['collected', 'received', 'processing', 'analyzed', 'rejected', 'discarded'],
        default: 'collected'
    }),
    __metadata("design:type", String)
], LabSample.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LabSample.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LabSample.prototype, "storageLocation", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LabSample.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LabSample.prototype, "updatedAt", void 0);
LabSample = __decorate([
    (0, typeorm_1.Entity)('lab_samples')
], LabSample);
exports.LabSample = LabSample;
