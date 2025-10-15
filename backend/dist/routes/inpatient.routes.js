"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const roles_1 = require("../types/roles");
const error_middleware_1 = require("../middleware/error.middleware");
const inpatient_1 = require("../controllers/inpatient");
const router = (0, express_1.Router)();
// Middleware for different roles
const isDoctor = (0, rbac_middleware_1.authorize)({
    requireRole: roles_1.UserRole.DOCTOR
});
const isNurse = (0, rbac_middleware_1.authorize)({
    requireRole: roles_1.UserRole.NURSE
});
const isDoctorOrNurse = (0, rbac_middleware_1.authorize)({
    requireRole: [roles_1.UserRole.DOCTOR, roles_1.UserRole.NURSE]
});
const isAdmin = (0, rbac_middleware_1.authorize)({
    requireRole: [roles_1.UserRole.ADMIN, roles_1.UserRole.SUPER_ADMIN]
});
const isAdminOrNurse = (0, rbac_middleware_1.authorize)({
    requireRole: [roles_1.UserRole.ADMIN, roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.NURSE]
});
// ============ WARD ROUTES ============
router.get('/wards', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.WardController.getAllWards));
router.get('/wards/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.WardController.getWardById));
router.post('/wards', auth_middleware_1.authenticate, isAdmin, (0, error_middleware_1.errorHandler)(inpatient_1.WardController.createWard));
router.put('/wards/:id', auth_middleware_1.authenticate, isAdmin, (0, error_middleware_1.errorHandler)(inpatient_1.WardController.updateWard));
router.delete('/wards/:id', auth_middleware_1.authenticate, isAdmin, (0, error_middleware_1.errorHandler)(inpatient_1.WardController.deleteWard));
router.get('/wards/:id/occupancy', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.WardController.getWardOccupancy));
// ============ ROOM ROUTES ============
router.get('/rooms', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.RoomController.getAllRooms));
router.get('/rooms/ward/:wardId', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.RoomController.getRoomsByWard));
router.get('/rooms/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.RoomController.getRoomById));
router.post('/rooms', auth_middleware_1.authenticate, isAdmin, (0, error_middleware_1.errorHandler)(inpatient_1.RoomController.createRoom));
router.put('/rooms/:id', auth_middleware_1.authenticate, isAdmin, (0, error_middleware_1.errorHandler)(inpatient_1.RoomController.updateRoom));
router.delete('/rooms/:id', auth_middleware_1.authenticate, isAdmin, (0, error_middleware_1.errorHandler)(inpatient_1.RoomController.deleteRoom));
// ============ BED ROUTES ============
router.get('/beds', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.BedController.getAllBeds));
router.get('/beds/room/:roomId', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.BedController.getBedsByRoom));
router.get('/beds/available', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.BedController.getAvailableBeds));
router.get('/beds/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.BedController.getBedById));
router.post('/beds', auth_middleware_1.authenticate, isAdmin, (0, error_middleware_1.errorHandler)(inpatient_1.BedController.createBed));
router.put('/beds/:id', auth_middleware_1.authenticate, isAdmin, (0, error_middleware_1.errorHandler)(inpatient_1.BedController.updateBed));
router.put('/beds/:id/status', auth_middleware_1.authenticate, isAdminOrNurse, (0, error_middleware_1.errorHandler)(inpatient_1.BedController.changeBedStatus));
router.delete('/beds/:id', auth_middleware_1.authenticate, isAdmin, (0, error_middleware_1.errorHandler)(inpatient_1.BedController.deleteBed));
// ============ ADMISSION ROUTES ============
router.post('/admissions', auth_middleware_1.authenticate, isDoctorOrNurse, (0, error_middleware_1.errorHandler)(inpatient_1.AdmissionController.createAdmission));
router.get('/admissions', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.AdmissionController.getAllAdmissions));
router.get('/admissions/current', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.AdmissionController.getCurrentAdmissions));
router.get('/admissions/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.AdmissionController.getAdmissionById));
router.get('/admissions/patient/:patientId', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.AdmissionController.getPatientAdmissions));
router.get('/admissions/doctor/:doctorId', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.AdmissionController.getDoctorPatients));
router.put('/admissions/:id/transfer', auth_middleware_1.authenticate, isDoctorOrNurse, (0, error_middleware_1.errorHandler)(inpatient_1.AdmissionController.transferPatient));
router.put('/admissions/:id/discharge', auth_middleware_1.authenticate, isDoctor, (0, error_middleware_1.errorHandler)(inpatient_1.AdmissionController.dischargePatient));
// ============ NURSING CARE ROUTES ============
// Nursing Notes
router.post('/nursing-notes', auth_middleware_1.authenticate, isNurse, (0, error_middleware_1.errorHandler)(inpatient_1.NursingCareController.createNursingNote));
router.get('/nursing-notes/admission/:admissionId', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.NursingCareController.getNursingNotesByAdmission));
// Vital Signs
router.post('/vital-signs', auth_middleware_1.authenticate, isDoctorOrNurse, (0, error_middleware_1.errorHandler)(inpatient_1.NursingCareController.recordVitalSigns));
router.get('/vital-signs/admission/:admissionId', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.NursingCareController.getVitalSignsByAdmission));
router.get('/vital-signs/admission/:admissionId/latest', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.NursingCareController.getLatestVitalSigns));
// Medication Administration
router.post('/medications', auth_middleware_1.authenticate, isNurse, (0, error_middleware_1.errorHandler)(inpatient_1.NursingCareController.administerMedication));
router.get('/medications/admission/:admissionId', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.NursingCareController.getMedicationsByAdmission));
// Care History
router.get('/care-history/:admissionId', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.NursingCareController.getCareHistory));
// ============ DOCTOR ROUNDS ROUTES ============
// Doctor Notes
router.post('/doctor-notes', auth_middleware_1.authenticate, isDoctor, (0, error_middleware_1.errorHandler)(inpatient_1.DoctorRoundsController.createDoctorNote));
router.get('/doctor-notes/admission/:admissionId', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.DoctorRoundsController.getDoctorNotesByAdmission));
router.get('/doctor-rounds/patients', auth_middleware_1.authenticate, isDoctor, (0, error_middleware_1.errorHandler)(inpatient_1.DoctorRoundsController.getDoctorPatients));
// Discharge Summary
router.post('/discharge-summary', auth_middleware_1.authenticate, isDoctor, (0, error_middleware_1.errorHandler)(inpatient_1.DoctorRoundsController.createDischargeSummary));
router.get('/discharge-summary/admission/:admissionId', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inpatient_1.DoctorRoundsController.getDischargeSummary));
router.put('/discharge-summary/:id', auth_middleware_1.authenticate, isDoctor, (0, error_middleware_1.errorHandler)(inpatient_1.DoctorRoundsController.updateDischargeSummary));
exports.default = router;
