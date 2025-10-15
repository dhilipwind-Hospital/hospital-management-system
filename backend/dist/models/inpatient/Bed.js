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
exports.Bed = exports.BedStatus = void 0;
const typeorm_1 = require("typeorm");
const Room_1 = require("./Room");
const Admission_1 = require("./Admission");
var BedStatus;
(function (BedStatus) {
    BedStatus["AVAILABLE"] = "available";
    BedStatus["OCCUPIED"] = "occupied";
    BedStatus["RESERVED"] = "reserved";
    BedStatus["MAINTENANCE"] = "maintenance";
    BedStatus["CLEANING"] = "cleaning";
})(BedStatus = exports.BedStatus || (exports.BedStatus = {}));
let Bed = class Bed {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Bed.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Bed.prototype, "bedNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Room_1.Room, room => room.beds),
    (0, typeorm_1.JoinColumn)({ name: 'room_id' }),
    __metadata("design:type", Room_1.Room)
], Bed.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'room_id', type: 'uuid' }),
    __metadata("design:type", String)
], Bed.prototype, "roomId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BedStatus,
        default: BedStatus.AVAILABLE,
    }),
    __metadata("design:type", String)
], Bed.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Bed.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Admission_1.Admission, admission => admission.bed, { nullable: true }),
    __metadata("design:type", Admission_1.Admission)
], Bed.prototype, "currentAdmission", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Bed.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Bed.prototype, "updatedAt", void 0);
Bed = __decorate([
    (0, typeorm_1.Entity)('beds')
], Bed);
exports.Bed = Bed;
