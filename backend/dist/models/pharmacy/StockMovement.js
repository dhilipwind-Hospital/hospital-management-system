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
exports.StockMovement = exports.MovementType = void 0;
const typeorm_1 = require("typeorm");
const Medicine_1 = require("./Medicine");
const User_1 = require("../User");
var MovementType;
(function (MovementType) {
    MovementType["PURCHASE"] = "purchase";
    MovementType["SALE"] = "sale";
    MovementType["RETURN"] = "return";
    MovementType["ADJUSTMENT"] = "adjustment";
    MovementType["EXPIRED"] = "expired";
    MovementType["DAMAGED"] = "damaged";
    MovementType["TRANSFER"] = "transfer";
})(MovementType = exports.MovementType || (exports.MovementType = {}));
let StockMovement = class StockMovement {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StockMovement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Medicine_1.Medicine),
    (0, typeorm_1.JoinColumn)({ name: 'medicine_id' }),
    __metadata("design:type", Medicine_1.Medicine)
], StockMovement.prototype, "medicine", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MovementType
    }),
    __metadata("design:type", String)
], StockMovement.prototype, "movementType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], StockMovement.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], StockMovement.prototype, "previousStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], StockMovement.prototype, "newStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'performed_by' }),
    __metadata("design:type", User_1.User)
], StockMovement.prototype, "performedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StockMovement.prototype, "createdAt", void 0);
StockMovement = __decorate([
    (0, typeorm_1.Entity)({ name: 'stock_movements' })
], StockMovement);
exports.StockMovement = StockMovement;
