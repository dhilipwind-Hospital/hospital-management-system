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
exports.Admission = exports.AdmissionStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
const Bed_1 = require("./Bed");
const NursingNote_1 = require("./NursingNote");
const DoctorNote_1 = require("./DoctorNote");
const VitalSign_1 = require("./VitalSign");
const MedicationAdministration_1 = require("./MedicationAdministration");
const DischargeSummary_1 = require("./DischargeSummary");
var AdmissionStatus;
(function (AdmissionStatus) {
    AdmissionStatus["ADMITTED"] = "admitted";
    AdmissionStatus["DISCHARGED"] = "discharged";
    AdmissionStatus["TRANSFERRED"] = "transferred";
    AdmissionStatus["ABSCONDED"] = "absconded";
    AdmissionStatus["DECEASED"] = "deceased";
})(AdmissionStatus = exports.AdmissionStatus || (exports.AdmissionStatus = {}));
let Admission = class Admission {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Admission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Admission.prototype, "admissionNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", User_1.User)
], Admission.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], Admission.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'admitting_doctor_id' }),
    __metadata("design:type", User_1.User)
], Admission.prototype, "admittingDoctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admitting_doctor_id', type: 'uuid' }),
    __metadata("design:type", String)
], Admission.prototype, "admittingDoctorId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Bed_1.Bed, bed => bed.currentAdmission),
    (0, typeorm_1.JoinColumn)({ name: 'bed_id' }),
    __metadata("design:type", Bed_1.Bed)
], Admission.prototype, "bed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bed_id', type: 'uuid' }),
    __metadata("design:type", String)
], Admission.prototype, "bedId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Admission.prototype, "admissionDateTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Admission.prototype, "dischargeDateTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Admission.prototype, "admissionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Admission.prototype, "admissionDiagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AdmissionStatus,
        default: AdmissionStatus.ADMITTED,
    }),
    __metadata("design:type", String)
], Admission.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Admission.prototype, "allergies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Admission.prototype, "specialInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Admission.prototype, "isEmergency", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => NursingNote_1.NursingNote, note => note.admission),
    __metadata("design:type", Array)
], Admission.prototype, "nursingNotes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DoctorNote_1.DoctorNote, note => note.admission),
    __metadata("design:type", Array)
], Admission.prototype, "doctorNotes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => VitalSign_1.VitalSign, vital => vital.admission),
    __metadata("design:type", Array)
], Admission.prototype, "vitalSigns", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MedicationAdministration_1.MedicationAdministration, med => med.admission),
    __metadata("design:type", Array)
], Admission.prototype, "medications", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => DischargeSummary_1.DischargeSummary, summary => summary.admission, { nullable: true }),
    __metadata("design:type", DischargeSummary_1.DischargeSummary)
], Admission.prototype, "dischargeSummary", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Admission.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Admission.prototype, "updatedAt", void 0);
Admission = __decorate([
    (0, typeorm_1.Entity)('admissions')
], Admission);
exports.Admission = Admission;
