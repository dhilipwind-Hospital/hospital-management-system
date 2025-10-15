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
exports.NursingNote = exports.NursingNoteType = void 0;
const typeorm_1 = require("typeorm");
const Admission_1 = require("./Admission");
const User_1 = require("../User");
var NursingNoteType;
(function (NursingNoteType) {
    NursingNoteType["ROUTINE"] = "routine";
    NursingNoteType["MEDICATION"] = "medication";
    NursingNoteType["PROCEDURE"] = "procedure";
    NursingNoteType["ASSESSMENT"] = "assessment";
    NursingNoteType["OTHER"] = "other";
})(NursingNoteType = exports.NursingNoteType || (exports.NursingNoteType = {}));
let NursingNote = class NursingNote {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NursingNote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Admission_1.Admission, admission => admission.nursingNotes),
    (0, typeorm_1.JoinColumn)({ name: 'admission_id' }),
    __metadata("design:type", Admission_1.Admission)
], NursingNote.prototype, "admission", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admission_id', type: 'uuid' }),
    __metadata("design:type", String)
], NursingNote.prototype, "admissionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'nurse_id' }),
    __metadata("design:type", User_1.User)
], NursingNote.prototype, "nurse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nurse_id', type: 'uuid' }),
    __metadata("design:type", String)
], NursingNote.prototype, "nurseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], NursingNote.prototype, "noteDateTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], NursingNote.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NursingNoteType,
        default: NursingNoteType.ROUTINE,
    }),
    __metadata("design:type", String)
], NursingNote.prototype, "noteType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NursingNote.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], NursingNote.prototype, "updatedAt", void 0);
NursingNote = __decorate([
    (0, typeorm_1.Entity)('nursing_notes')
], NursingNote);
exports.NursingNote = NursingNote;
