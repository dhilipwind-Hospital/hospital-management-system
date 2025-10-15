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
exports.MedicineTransaction = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const Medicine_1 = require("./Medicine");
const User_1 = require("../User");
var TransactionType;
(function (TransactionType) {
    TransactionType["PURCHASE"] = "purchase";
    TransactionType["SALE"] = "sale";
    TransactionType["RETURN"] = "return";
    TransactionType["ADJUSTMENT"] = "adjustment";
    TransactionType["EXPIRED"] = "expired";
    TransactionType["DAMAGED"] = "damaged";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
let MedicineTransaction = class MedicineTransaction {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MedicineTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Medicine_1.Medicine),
    (0, typeorm_1.JoinColumn)({ name: 'medicine_id' }),
    __metadata("design:type", Medicine_1.Medicine)
], MedicineTransaction.prototype, "medicine", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medicine_id', type: 'uuid' }),
    __metadata("design:type", String)
], MedicineTransaction.prototype, "medicineId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionType,
        default: TransactionType.PURCHASE
    }),
    (0, class_validator_1.IsEnum)(TransactionType, { message: 'Invalid transaction type' }),
    __metadata("design:type", String)
], MedicineTransaction.prototype, "transactionType", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    (0, class_validator_1.IsInt)({ message: 'Quantity must be an integer' }),
    __metadata("design:type", Number)
], MedicineTransaction.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, class_validator_1.IsDate)({ message: 'Transaction date must be a valid date' }),
    __metadata("design:type", Date)
], MedicineTransaction.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Reference must be a string' }),
    __metadata("design:type", String)
], MedicineTransaction.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Notes must be a string' }),
    __metadata("design:type", String)
], MedicineTransaction.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'performed_by' }),
    __metadata("design:type", User_1.User)
], MedicineTransaction.prototype, "performedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performed_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MedicineTransaction.prototype, "performedById", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MedicineTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MedicineTransaction.prototype, "updatedAt", void 0);
MedicineTransaction = __decorate([
    (0, typeorm_1.Entity)('medicine_transactions')
], MedicineTransaction);
exports.MedicineTransaction = MedicineTransaction;
