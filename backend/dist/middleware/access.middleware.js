"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforcePatientReportAccess = exports.canDoctorAccessPatient = void 0;
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const Referral_1 = require("../models/Referral");
const roles_1 = require("../types/roles");
const Appointment_1 = require("../models/Appointment");
/**
 * Utility: check if a doctor (by id) can access a patient's records based on FR-001.
 * Access if:
 *  - doctor's departmentId === patient's primaryDepartmentId, OR
 *  - there exists a referral for the patient to the doctor's department
 */
async function canDoctorAccessPatient(patientId, doctorId) {
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    const referralRepo = database_1.AppDataSource.getRepository(Referral_1.Referral);
    const apptRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    const doctor = await userRepo.findOne({ where: { id: doctorId } });
    const patient = await userRepo.findOne({ where: { id: patientId } });
    if (!doctor || !patient)
        return false;
    if (String(doctor.role).toLowerCase() !== String(roles_1.UserRole.DOCTOR).toLowerCase())
        return false;
    // Primary department match
    if (doctor.departmentId && patient.primaryDepartmentId && doctor.departmentId === patient.primaryDepartmentId) {
        return true;
    }
    // Referral-based match
    if (doctor.departmentId) {
        const exists = await referralRepo.findOne({ where: { patientId, departmentId: doctor.departmentId } });
        if (exists)
            return true;
    }
    // Treated-patient access: any appointment between this doctor and patient
    const hasAppt = await apptRepo.createQueryBuilder('a')
        .leftJoin('a.doctor', 'doctor')
        .leftJoin('a.patient', 'patient')
        .where('doctor.id = :doctorId', { doctorId })
        .andWhere('patient.id = :patientId', { patientId })
        .limit(1)
        .getOne();
    if (hasAppt)
        return true;
    return false;
}
exports.canDoctorAccessPatient = canDoctorAccessPatient;
/**
 * Middleware: enforce FR-001 department access rules for patient reports
 * Expects req.user.id (doctor) and req.params.patientId (or provided via getter)
 */
function enforcePatientReportAccess(getPatientId) {
    return async (req, res, next) => {
        var _a, _b;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const role = String(((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || '').toLowerCase();
            if (!userId)
                return res.status(401).json({ message: 'Authentication required' });
            // Admin/super_admin bypass
            if (role === 'admin' || role === 'super_admin')
                return next();
            const patientId = getPatientId(req);
            if (!patientId)
                return res.status(400).json({ message: 'patientId required' });
            const ok = await canDoctorAccessPatient(patientId, userId);
            if (!ok)
                return res.status(403).json({ message: 'Access denied by department policy (FR-001)' });
            return next();
        }
        catch (e) {
            console.error('Access check error:', e);
            return res.status(500).json({ message: 'Access check failed' });
        }
    };
}
exports.enforcePatientReportAccess = enforcePatientReportAccess;
