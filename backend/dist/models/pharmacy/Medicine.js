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
exports.Medicine = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let Medicine = class Medicine {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Medicine.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Medicine name is required' }),
    __metadata("design:type", String)
], Medicine.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Generic name is required' }),
    __metadata("design:type", String)
], Medicine.prototype, "genericName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Brand name is required' }),
    __metadata("design:type", String)
], Medicine.prototype, "brandName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Manufacturer is required' }),
    __metadata("design:type", String)
], Medicine.prototype, "manufacturer", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Category is required' }),
    __metadata("design:type", String)
], Medicine.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Dosage form is required' }),
    __metadata("design:type", String)
], Medicine.prototype, "dosageForm", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Strength is required' }),
    __metadata("design:type", String)
], Medicine.prototype, "strength", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    (0, class_validator_1.IsNumber)({}, { message: 'Unit price must be a number' }),
    __metadata("design:type", Number)
], Medicine.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    (0, class_validator_1.IsNumber)({}, { message: 'Selling price must be a number' }),
    __metadata("design:type", Number)
], Medicine.prototype, "sellingPrice", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Batch number is required' }),
    __metadata("design:type", String)
], Medicine.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, class_validator_1.IsDate)({ message: 'Manufacture date must be a valid date' }),
    __metadata("design:type", Date)
], Medicine.prototype, "manufactureDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, class_validator_1.IsDate)({ message: 'Expiry date must be a valid date' }),
    __metadata("design:type", Date)
], Medicine.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    (0, class_validator_1.IsNumber)({}, { message: 'Current stock must be a number' }),
    __metadata("design:type", Number)
], Medicine.prototype, "currentStock", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    (0, class_validator_1.IsNumber)({}, { message: 'Reorder level must be a number' }),
    __metadata("design:type", Number)
], Medicine.prototype, "reorderLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Medicine.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    __metadata("design:type", String)
], Medicine.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Side effects must be a string' }),
    __metadata("design:type", String)
], Medicine.prototype, "sideEffects", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Contraindications must be a string' }),
    __metadata("design:type", String)
], Medicine.prototype, "contraindications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Storage instructions must be a string' }),
    __metadata("design:type", String)
], Medicine.prototype, "storageInstructions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Medicine.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Medicine.prototype, "updatedAt", void 0);
Medicine = __decorate([
    (0, typeorm_1.Entity)('medicines')
], Medicine);
exports.Medicine = Medicine;
