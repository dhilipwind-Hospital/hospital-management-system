"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTestDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("../../models/User");
const Service_1 = require("../../models/Service");
const Department_1 = require("../../models/Department");
const Appointment_1 = require("../../models/Appointment");
const RefreshToken_1 = require("../../models/RefreshToken");
const MedicalRecord_1 = require("../../models/MedicalRecord");
const Bill_1 = require("../../models/Bill");
const AvailabilitySlot_1 = require("../../models/AvailabilitySlot");
const Referral_1 = require("../../models/Referral");
const Report_1 = require("../../models/Report");
const EmergencyRequest_1 = require("../../models/EmergencyRequest");
const CallbackRequest_1 = require("../../models/CallbackRequest");
const Plan_1 = require("../../models/Plan");
const Policy_1 = require("../../models/Policy");
const Claim_1 = require("../../models/Claim");
const buildTestDataSource = () => {
    const host = process.env.TEST_DB_HOST || process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.TEST_DB_PORT || process.env.DB_PORT || '5432', 10);
    const username = process.env.TEST_DB_USER || process.env.DB_USER || 'postgres';
    const password = process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres';
    const database = process.env.TEST_DB_NAME || process.env.DB_NAME || 'hospital_db_test';
    return new typeorm_1.DataSource({
        type: 'postgres',
        host,
        port,
        username,
        password,
        database,
        entities: [User_1.User, Service_1.Service, Department_1.Department, Appointment_1.Appointment, RefreshToken_1.RefreshToken, MedicalRecord_1.MedicalRecord, Bill_1.Bill, AvailabilitySlot_1.AvailabilitySlot, Referral_1.Referral, Report_1.Report, EmergencyRequest_1.EmergencyRequest, CallbackRequest_1.CallbackRequest, Plan_1.Plan, Policy_1.Policy, Claim_1.Claim],
        synchronize: true,
        logging: false,
    });
};
exports.buildTestDataSource = buildTestDataSource;
