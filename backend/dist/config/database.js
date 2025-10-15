"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabaseConnection = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../models/User");
const Service_1 = require("../models/Service");
const Department_1 = require("../models/Department");
const Appointment_1 = require("../models/Appointment");
const RefreshToken_1 = require("../models/RefreshToken");
const MedicalRecord_1 = require("../models/MedicalRecord");
const Bill_1 = require("../models/Bill");
const AvailabilitySlot_1 = require("../models/AvailabilitySlot");
const Referral_1 = require("../models/Referral");
const Report_1 = require("../models/Report");
const EmergencyRequest_1 = require("../models/EmergencyRequest");
const CallbackRequest_1 = require("../models/CallbackRequest");
const Plan_1 = require("../models/Plan");
const Policy_1 = require("../models/Policy");
const Claim_1 = require("../models/Claim");
const AppointmentHistory_1 = require("../models/AppointmentHistory");
const Medicine_1 = require("../models/pharmacy/Medicine");
const Prescription_1 = require("../models/pharmacy/Prescription");
const PrescriptionItem_1 = require("../models/pharmacy/PrescriptionItem");
const MedicineTransaction_1 = require("../models/pharmacy/MedicineTransaction");
const LabTest_1 = require("../models/LabTest");
const LabOrder_1 = require("../models/LabOrder");
const LabOrderItem_1 = require("../models/LabOrderItem");
const LabSample_1 = require("../models/LabSample");
const LabResult_1 = require("../models/LabResult");
const ConsultationNote_1 = require("../models/ConsultationNote");
const Ward_1 = require("../models/inpatient/Ward");
const Room_1 = require("../models/inpatient/Room");
const Bed_1 = require("../models/inpatient/Bed");
const Admission_1 = require("../models/inpatient/Admission");
const NursingNote_1 = require("../models/inpatient/NursingNote");
const VitalSign_1 = require("../models/inpatient/VitalSign");
const MedicationAdministration_1 = require("../models/inpatient/MedicationAdministration");
const DoctorNote_1 = require("../models/inpatient/DoctorNote");
const DischargeSummary_1 = require("../models/inpatient/DischargeSummary");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'hospital_db',
    entities: [User_1.User, Service_1.Service, Department_1.Department, Appointment_1.Appointment, RefreshToken_1.RefreshToken, MedicalRecord_1.MedicalRecord, Bill_1.Bill, AvailabilitySlot_1.AvailabilitySlot, Referral_1.Referral, Report_1.Report, EmergencyRequest_1.EmergencyRequest, CallbackRequest_1.CallbackRequest, Plan_1.Plan, Policy_1.Policy, Claim_1.Claim, AppointmentHistory_1.AppointmentHistory, Medicine_1.Medicine, Prescription_1.Prescription, PrescriptionItem_1.PrescriptionItem, MedicineTransaction_1.MedicineTransaction, LabTest_1.LabTest, LabOrder_1.LabOrder, LabOrderItem_1.LabOrderItem, LabSample_1.LabSample, LabResult_1.LabResult, ConsultationNote_1.ConsultationNote, Ward_1.Ward, Room_1.Room, Bed_1.Bed, Admission_1.Admission, NursingNote_1.NursingNote, VitalSign_1.VitalSign, MedicationAdministration_1.MedicationAdministration, DoctorNote_1.DoctorNote, DischargeSummary_1.DischargeSummary],
    migrations: [__dirname + '/../migrations/*.{ts,js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
});
// Backward-compatible wrapper used by server.ts
const createDatabaseConnection = async () => {
    if (!exports.AppDataSource.isInitialized) {
        await exports.AppDataSource.initialize();
    }
    return exports.AppDataSource;
};
exports.createDatabaseConnection = createDatabaseConnection;
