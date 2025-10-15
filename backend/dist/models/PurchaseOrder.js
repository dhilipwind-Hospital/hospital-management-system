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
exports.PurchaseOrder = exports.PurchaseOrderStatus = void 0;
const typeorm_1 = require("typeorm");
const Supplier_1 = require("./Supplier");
const User_1 = require("./User");
var PurchaseOrderStatus;
(function (PurchaseOrderStatus) {
    PurchaseOrderStatus["DRAFT"] = "draft";
    PurchaseOrderStatus["PENDING"] = "pending";
    PurchaseOrderStatus["APPROVED"] = "approved";
    PurchaseOrderStatus["ORDERED"] = "ordered";
    PurchaseOrderStatus["RECEIVED"] = "received";
    PurchaseOrderStatus["CANCELLED"] = "cancelled";
})(PurchaseOrderStatus = exports.PurchaseOrderStatus || (exports.PurchaseOrderStatus = {}));
let PurchaseOrder = class PurchaseOrder {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "orderNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Supplier_1.Supplier),
    (0, typeorm_1.JoinColumn)({ name: 'supplier_id' }),
    __metadata("design:type", Supplier_1.Supplier)
], PurchaseOrder.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PurchaseOrderStatus,
        default: PurchaseOrderStatus.DRAFT
    }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], PurchaseOrder.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PurchaseOrder.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "expectedDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "receivedDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", User_1.User)
], PurchaseOrder.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by' }),
    __metadata("design:type", User_1.User)
], PurchaseOrder.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "updatedAt", void 0);
PurchaseOrder = __decorate([
    (0, typeorm_1.Entity)({ name: 'purchase_orders' })
], PurchaseOrder);
exports.PurchaseOrder = PurchaseOrder;
