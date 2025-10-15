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
exports.VitalSigns = exports.HeightUnit = exports.WeightUnit = exports.TemperatureUnit = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const ConsultationNote_1 = require("./ConsultationNote");
var TemperatureUnit;
(function (TemperatureUnit) {
    TemperatureUnit["CELSIUS"] = "C";
    TemperatureUnit["FAHRENHEIT"] = "F";
})(TemperatureUnit = exports.TemperatureUnit || (exports.TemperatureUnit = {}));
var WeightUnit;
(function (WeightUnit) {
    WeightUnit["KG"] = "kg";
    WeightUnit["LBS"] = "lbs";
})(WeightUnit = exports.WeightUnit || (exports.WeightUnit = {}));
var HeightUnit;
(function (HeightUnit) {
    HeightUnit["CM"] = "cm";
    HeightUnit["IN"] = "in";
})(HeightUnit = exports.HeightUnit || (exports.HeightUnit = {}));
let VitalSigns = class VitalSigns {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VitalSigns.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", User_1.User)
], VitalSigns.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ConsultationNote_1.ConsultationNote, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'consultation_id' }),
    __metadata("design:type", ConsultationNote_1.ConsultationNote)
], VitalSigns.prototype, "consultation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'recorded_by' }),
    __metadata("design:type", User_1.User)
], VitalSigns.prototype, "recordedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], VitalSigns.prototype, "systolicBp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], VitalSigns.prototype, "diastolicBp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], VitalSigns.prototype, "heartRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], VitalSigns.prototype, "respiratoryRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], VitalSigns.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TemperatureUnit,
        default: TemperatureUnit.CELSIUS
    }),
    __metadata("design:type", String)
], VitalSigns.prototype, "temperatureUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], VitalSigns.prototype, "oxygenSaturation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], VitalSigns.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: WeightUnit,
        default: WeightUnit.KG
    }),
    __metadata("design:type", String)
], VitalSigns.prototype, "weightUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], VitalSigns.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: HeightUnit,
        default: HeightUnit.CM
    }),
    __metadata("design:type", String)
], VitalSigns.prototype, "heightUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], VitalSigns.prototype, "bmi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], VitalSigns.prototype, "painScale", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'recorded_at' }),
    __metadata("design:type", Date)
], VitalSigns.prototype, "recordedAt", void 0);
VitalSigns = __decorate([
    (0, typeorm_1.Entity)({ name: 'vital_signs' })
], VitalSigns);
exports.VitalSigns = VitalSigns;
