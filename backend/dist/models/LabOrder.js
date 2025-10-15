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
exports.LabOrder = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const LabOrderItem_1 = require("./LabOrderItem");
let LabOrder = class LabOrder {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LabOrder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], LabOrder.prototype, "orderNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'doctor_id' }),
    __metadata("design:type", User_1.User)
], LabOrder.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'doctor_id', type: 'uuid' }),
    __metadata("design:type", String)
], LabOrder.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", User_1.User)
], LabOrder.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], LabOrder.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], LabOrder.prototype, "orderDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LabOrder.prototype, "clinicalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LabOrder.prototype, "diagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled'],
        default: 'ordered'
    }),
    __metadata("design:type", String)
], LabOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], LabOrder.prototype, "isUrgent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => LabOrderItem_1.LabOrderItem, item => item.labOrder, { cascade: true }),
    __metadata("design:type", Array)
], LabOrder.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LabOrder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LabOrder.prototype, "updatedAt", void 0);
LabOrder = __decorate([
    (0, typeorm_1.Entity)('lab_orders')
], LabOrder);
exports.LabOrder = LabOrder;
