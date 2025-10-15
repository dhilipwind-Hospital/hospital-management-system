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
exports.StockAlert = exports.AlertStatus = exports.AlertType = void 0;
const typeorm_1 = require("typeorm");
const Medicine_1 = require("./Medicine");
var AlertType;
(function (AlertType) {
    AlertType["LOW_STOCK"] = "low_stock";
    AlertType["OUT_OF_STOCK"] = "out_of_stock";
    AlertType["NEAR_EXPIRY"] = "near_expiry";
    AlertType["EXPIRED"] = "expired";
    AlertType["CRITICAL_LOW"] = "critical_low";
})(AlertType = exports.AlertType || (exports.AlertType = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["ACTIVE"] = "active";
    AlertStatus["ACKNOWLEDGED"] = "acknowledged";
    AlertStatus["RESOLVED"] = "resolved";
})(AlertStatus = exports.AlertStatus || (exports.AlertStatus = {}));
let StockAlert = class StockAlert {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StockAlert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Medicine_1.Medicine),
    (0, typeorm_1.JoinColumn)({ name: 'medicine_id' }),
    __metadata("design:type", Medicine_1.Medicine)
], StockAlert.prototype, "medicine", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AlertType
    }),
    __metadata("design:type", String)
], StockAlert.prototype, "alertType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AlertStatus,
        default: AlertStatus.ACTIVE
    }),
    __metadata("design:type", String)
], StockAlert.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], StockAlert.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], StockAlert.prototype, "currentStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], StockAlert.prototype, "reorderLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], StockAlert.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], StockAlert.prototype, "daysUntilExpiry", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StockAlert.prototype, "createdAt", void 0);
StockAlert = __decorate([
    (0, typeorm_1.Entity)({ name: 'stock_alerts' })
], StockAlert);
exports.StockAlert = StockAlert;
