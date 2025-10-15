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
exports.PrescriptionItem = exports.PrescriptionItemStatus = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const Prescription_1 = require("./Prescription");
const Medicine_1 = require("./Medicine");
var PrescriptionItemStatus;
(function (PrescriptionItemStatus) {
    PrescriptionItemStatus["PENDING"] = "pending";
    PrescriptionItemStatus["DISPENSED"] = "dispensed";
    PrescriptionItemStatus["OUT_OF_STOCK"] = "out_of_stock";
    PrescriptionItemStatus["CANCELLED"] = "cancelled";
})(PrescriptionItemStatus = exports.PrescriptionItemStatus || (exports.PrescriptionItemStatus = {}));
let PrescriptionItem = class PrescriptionItem {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PrescriptionItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Prescription_1.Prescription, prescription => prescription.items),
    (0, typeorm_1.JoinColumn)({ name: 'prescription_id' }),
    __metadata("design:type", Prescription_1.Prescription)
], PrescriptionItem.prototype, "prescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prescription_id', type: 'uuid' }),
    __metadata("design:type", String)
], PrescriptionItem.prototype, "prescriptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Medicine_1.Medicine),
    (0, typeorm_1.JoinColumn)({ name: 'medicine_id' }),
    __metadata("design:type", Medicine_1.Medicine)
], PrescriptionItem.prototype, "medicine", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medicine_id', type: 'uuid' }),
    __metadata("design:type", String)
], PrescriptionItem.prototype, "medicineId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Dosage is required' }),
    __metadata("design:type", String)
], PrescriptionItem.prototype, "dosage", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Frequency is required' }),
    __metadata("design:type", String)
], PrescriptionItem.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Duration is required' }),
    __metadata("design:type", String)
], PrescriptionItem.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Instructions must be a string' }),
    __metadata("design:type", String)
], PrescriptionItem.prototype, "instructions", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    (0, class_validator_1.IsInt)({ message: 'Quantity must be an integer' }),
    __metadata("design:type", Number)
], PrescriptionItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PrescriptionItemStatus,
        default: PrescriptionItemStatus.PENDING
    }),
    (0, class_validator_1.IsEnum)(PrescriptionItemStatus, { message: 'Invalid prescription item status' }),
    __metadata("design:type", String)
], PrescriptionItem.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PrescriptionItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PrescriptionItem.prototype, "updatedAt", void 0);
PrescriptionItem = __decorate([
    (0, typeorm_1.Entity)('prescription_items')
], PrescriptionItem);
exports.PrescriptionItem = PrescriptionItem;
