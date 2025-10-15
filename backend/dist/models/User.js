"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const bcrypt = __importStar(require("bcryptjs"));
const Appointment_1 = require("./Appointment");
const Department_1 = require("./Department");
const RefreshToken_1 = require("./RefreshToken");
const roles_1 = require("../types/roles");
let User = class User {
    constructor() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        this.password = '';
        this.role = roles_1.UserRole.PATIENT;
        this.permissions = [];
        this.isActive = true;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    async hashPassword() {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    async validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.Length)(2, 50),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.Length)(2, 50),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(7, 20),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.Length)(8),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Object.values(roles_1.UserRole),
        default: roles_1.UserRole.PATIENT
    }),
    (0, class_validator_1.IsEnum)(roles_1.UserRole, { message: 'Invalid role' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Object.values(roles_1.Permission),
        array: true,
        default: []
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], User.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], User.prototype, "preferences", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true, name: 'global_patient_id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "globalPatientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'location_code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "locationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'registered_location' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "registeredLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'registered_year', type: 'int' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], User.prototype, "registeredYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'patient_sequence_number', type: 'int' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], User.prototype, "patientSequenceNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Department_1.Department, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'department_id' }),
    __metadata("design:type", Object)
], User.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Department_1.Department, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'primary_department_id' }),
    __metadata("design:type", Object)
], User.prototype, "primaryDepartment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primary_department_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "primaryDepartmentId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Appointment_1.Appointment, appointment => appointment.patient),
    __metadata("design:type", Array)
], User.prototype, "appointments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RefreshToken_1.RefreshToken, refreshToken => refreshToken.user),
    __metadata("design:type", Array)
], User.prototype, "refreshTokens", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
exports.User = User;
