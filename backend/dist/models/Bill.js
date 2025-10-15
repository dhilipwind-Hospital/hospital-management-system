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
exports.Bill = exports.PaymentMethod = exports.BillStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Appointment_1 = require("./Appointment");
const class_validator_1 = require("class-validator");
var BillStatus;
(function (BillStatus) {
    BillStatus["PENDING"] = "pending";
    BillStatus["PAID"] = "paid";
    BillStatus["OVERDUE"] = "overdue";
    BillStatus["CANCELLED"] = "cancelled";
})(BillStatus = exports.BillStatus || (exports.BillStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CARD"] = "card";
    PaymentMethod["INSURANCE"] = "insurance";
    PaymentMethod["ONLINE"] = "online";
})(PaymentMethod = exports.PaymentMethod || (exports.PaymentMethod = {}));
let Bill = class Bill {
    constructor() {
        this.paidAmount = 0;
        this.status = BillStatus.PENDING;
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Bill.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", User_1.User)
], Bill.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Appointment_1.Appointment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'appointment_id' }),
    __metadata("design:type", Appointment_1.Appointment)
], Bill.prototype, "appointment", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Bill.prototype, "billNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], Bill.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], Bill.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BillStatus,
        default: BillStatus.PENDING
    }),
    (0, class_validator_1.IsEnum)(BillStatus),
    __metadata("design:type", String)
], Bill.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentMethod,
        nullable: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], Bill.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Bill.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], Bill.prototype, "itemDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], Bill.prototype, "billDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], Bill.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], Bill.prototype, "paidDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Bill.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Bill.prototype, "updatedAt", void 0);
Bill = __decorate([
    (0, typeorm_1.Entity)('bills')
], Bill);
exports.Bill = Bill;
