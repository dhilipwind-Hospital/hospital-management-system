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
exports.LabOrderItem = void 0;
const typeorm_1 = require("typeorm");
const LabOrder_1 = require("./LabOrder");
const LabTest_1 = require("./LabTest");
const LabSample_1 = require("./LabSample");
const LabResult_1 = require("./LabResult");
let LabOrderItem = class LabOrderItem {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LabOrderItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => LabOrder_1.LabOrder, order => order.items),
    (0, typeorm_1.JoinColumn)({ name: 'lab_order_id' }),
    __metadata("design:type", LabOrder_1.LabOrder)
], LabOrderItem.prototype, "labOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lab_order_id', type: 'uuid' }),
    __metadata("design:type", String)
], LabOrderItem.prototype, "labOrderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => LabTest_1.LabTest),
    (0, typeorm_1.JoinColumn)({ name: 'lab_test_id' }),
    __metadata("design:type", LabTest_1.LabTest)
], LabOrderItem.prototype, "labTest", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lab_test_id', type: 'uuid' }),
    __metadata("design:type", String)
], LabOrderItem.prototype, "labTestId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled'],
        default: 'ordered'
    }),
    __metadata("design:type", String)
], LabOrderItem.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LabOrderItem.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => LabSample_1.LabSample, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sample_id' }),
    __metadata("design:type", LabSample_1.LabSample)
], LabOrderItem.prototype, "sample", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sample_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], LabOrderItem.prototype, "sampleId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => LabResult_1.LabResult, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'result_id' }),
    __metadata("design:type", LabResult_1.LabResult)
], LabOrderItem.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'result_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], LabOrderItem.prototype, "resultId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LabOrderItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LabOrderItem.prototype, "updatedAt", void 0);
LabOrderItem = __decorate([
    (0, typeorm_1.Entity)('lab_order_items')
], LabOrderItem);
exports.LabOrderItem = LabOrderItem;
