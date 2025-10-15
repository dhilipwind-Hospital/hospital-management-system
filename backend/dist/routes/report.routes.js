"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const roles_1 = require("../types/roles");
const error_middleware_1 = require("../middleware/error.middleware");
const report_controller_1 = require("../controllers/report.controller");
const access_middleware_1 = require("../middleware/access.middleware");
const database_1 = require("../config/database");
const Report_1 = require("../models/Report");
const router = (0, express_1.Router)();
// List patient reports (FR-001 enforced for doctor role)
router.get('/patients/:patientId/reports', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)({ requireRole: [roles_1.UserRole.DOCTOR, roles_1.UserRole.ADMIN, roles_1.UserRole.SUPER_ADMIN] }), (0, access_middleware_1.enforcePatientReportAccess)(req => req.params.patientId), (0, error_middleware_1.errorHandler)(report_controller_1.ReportController.listPatientReports));
// Get one report (FR-001 enforced for doctor role)
router.get('/reports/:reportId', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)({ requireRole: [roles_1.UserRole.DOCTOR, roles_1.UserRole.ADMIN, roles_1.UserRole.SUPER_ADMIN] }), 
// resolve patient id from report then enforce
async (req, res, next) => {
    try {
        const report = await database_1.AppDataSource.getRepository(Report_1.Report).findOne({ where: { id: req.params.reportId } });
        if (!report)
            return res.status(404).json({ message: 'Report not found' });
        req.__patientId = report.patientId;
        next();
    }
    catch (e) {
        next(e);
    }
}, (0, access_middleware_1.enforcePatientReportAccess)(req => req.__patientId), (0, error_middleware_1.errorHandler)(report_controller_1.ReportController.getReport));
// Create report (admin/doctors only)
router.post('/reports', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)({ requireRole: [roles_1.UserRole.DOCTOR, roles_1.UserRole.ADMIN, roles_1.UserRole.SUPER_ADMIN] }), 
// For doctors, enforce FR-001 using patientId from body; admins bypass in middleware
(0, access_middleware_1.enforcePatientReportAccess)(req => { var _a; return (_a = req.body) === null || _a === void 0 ? void 0 : _a.patientId; }), (0, error_middleware_1.errorHandler)(report_controller_1.ReportController.createReport));
exports.default = router;
