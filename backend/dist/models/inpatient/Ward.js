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
exports.Ward = void 0;
const typeorm_1 = require("typeorm");
const Department_1 = require("../Department");
const Room_1 = require("./Room");
let Ward = class Ward {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Ward.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Ward.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Ward.prototype, "wardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Ward.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Department_1.Department),
    (0, typeorm_1.JoinColumn)({ name: 'department_id' }),
    __metadata("design:type", Department_1.Department)
], Ward.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department_id', type: 'uuid' }),
    __metadata("design:type", String)
], Ward.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Ward.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Ward.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Ward.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Room_1.Room, room => room.ward),
    __metadata("design:type", Array)
], Ward.prototype, "rooms", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Ward.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Ward.prototype, "updatedAt", void 0);
Ward = __decorate([
    (0, typeorm_1.Entity)('wards')
], Ward);
exports.Ward = Ward;
