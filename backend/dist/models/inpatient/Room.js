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
exports.Room = exports.RoomType = void 0;
const typeorm_1 = require("typeorm");
const Ward_1 = require("./Ward");
const Bed_1 = require("./Bed");
var RoomType;
(function (RoomType) {
    RoomType["GENERAL"] = "general";
    RoomType["SEMI_PRIVATE"] = "semi_private";
    RoomType["PRIVATE"] = "private";
    RoomType["DELUXE"] = "deluxe";
    RoomType["ICU"] = "icu";
    RoomType["NICU"] = "nicu";
    RoomType["PICU"] = "picu";
    RoomType["ISOLATION"] = "isolation";
})(RoomType = exports.RoomType || (exports.RoomType = {}));
let Room = class Room {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Room.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Room.prototype, "roomNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Ward_1.Ward, ward => ward.rooms),
    (0, typeorm_1.JoinColumn)({ name: 'ward_id' }),
    __metadata("design:type", Ward_1.Ward)
], Room.prototype, "ward", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ward_id', type: 'uuid' }),
    __metadata("design:type", String)
], Room.prototype, "wardId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RoomType,
        default: RoomType.GENERAL,
    }),
    __metadata("design:type", String)
], Room.prototype, "roomType", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Room.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Room.prototype, "dailyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Room.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Room.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Bed_1.Bed, bed => bed.room),
    __metadata("design:type", Array)
], Room.prototype, "beds", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Room.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Room.prototype, "updatedAt", void 0);
Room = __decorate([
    (0, typeorm_1.Entity)('rooms')
], Room);
exports.Room = Room;
