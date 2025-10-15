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
exports.Allergy = exports.ReactionSeverity = exports.AllergenType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var AllergenType;
(function (AllergenType) {
    AllergenType["DRUG"] = "drug";
    AllergenType["FOOD"] = "food";
    AllergenType["ENVIRONMENTAL"] = "environmental";
    AllergenType["OTHER"] = "other";
})(AllergenType = exports.AllergenType || (exports.AllergenType = {}));
var ReactionSeverity;
(function (ReactionSeverity) {
    ReactionSeverity["MILD"] = "mild";
    ReactionSeverity["MODERATE"] = "moderate";
    ReactionSeverity["SEVERE"] = "severe";
    ReactionSeverity["LIFE_THREATENING"] = "life_threatening";
})(ReactionSeverity = exports.ReactionSeverity || (exports.ReactionSeverity = {}));
let Allergy = class Allergy {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Allergy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", User_1.User)
], Allergy.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AllergenType
    }),
    __metadata("design:type", String)
], Allergy.prototype, "allergenType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Allergy.prototype, "allergenName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReactionSeverity
    }),
    __metadata("design:type", String)
], Allergy.prototype, "reactionSeverity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Allergy.prototype, "reactionDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Allergy.prototype, "dateIdentified", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'verified_by' }),
    __metadata("design:type", User_1.User)
], Allergy.prototype, "verifiedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Allergy.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Allergy.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Allergy.prototype, "updatedAt", void 0);
Allergy = __decorate([
    (0, typeorm_1.Entity)({ name: 'allergies' })
], Allergy);
exports.Allergy = Allergy;
