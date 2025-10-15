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
exports.DoctorNote = exports.DoctorNoteType = void 0;
const typeorm_1 = require("typeorm");
const Admission_1 = require("./Admission");
const User_1 = require("../User");
var DoctorNoteType;
(function (DoctorNoteType) {
    DoctorNoteType["PROGRESS"] = "progress";
    DoctorNoteType["ADMISSION"] = "admission";
    DoctorNoteType["PROCEDURE"] = "procedure";
    DoctorNoteType["CONSULTATION"] = "consultation";
    DoctorNoteType["DISCHARGE"] = "discharge";
})(DoctorNoteType = exports.DoctorNoteType || (exports.DoctorNoteType = {}));
let DoctorNote = class DoctorNote {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DoctorNote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Admission_1.Admission, admission => admission.doctorNotes),
    (0, typeorm_1.JoinColumn)({ name: 'admission_id' }),
    __metadata("design:type", Admission_1.Admission)
], DoctorNote.prototype, "admission", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admission_id', type: 'uuid' }),
    __metadata("design:type", String)
], DoctorNote.prototype, "admissionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'doctor_id' }),
    __metadata("design:type", User_1.User)
], DoctorNote.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'doctor_id', type: 'uuid' }),
    __metadata("design:type", String)
], DoctorNote.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], DoctorNote.prototype, "noteDateTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DoctorNote.prototype, "subjective", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DoctorNote.prototype, "objective", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DoctorNote.prototype, "assessment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DoctorNote.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DoctorNoteType,
        default: DoctorNoteType.PROGRESS,
    }),
    __metadata("design:type", String)
], DoctorNote.prototype, "noteType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DoctorNote.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DoctorNote.prototype, "updatedAt", void 0);
DoctorNote = __decorate([
    (0, typeorm_1.Entity)('doctor_notes')
], DoctorNote);
exports.DoctorNote = DoctorNote;
