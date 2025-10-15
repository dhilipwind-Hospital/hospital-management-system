"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const roles_1 = require("../../types/roles");
const error_middleware_1 = require("../../middleware/error.middleware");
const medicine_controller_1 = require("../../controllers/pharmacy/medicine.controller");
const prescription_controller_1 = require("../../controllers/pharmacy/prescription.controller");
const inventory_controller_1 = require("../../controllers/pharmacy/inventory.controller");
const router = (0, express_1.Router)();
// Middleware for pharmacy-related roles
const isPharmacistOrAdmin = (0, rbac_middleware_1.authorize)({
    requireOneOf: [roles_1.Permission.MANAGE_INVENTORY],
    requireRole: [roles_1.UserRole.PHARMACIST, roles_1.UserRole.ADMIN, roles_1.UserRole.SUPER_ADMIN]
});
const isPharmacist = (0, rbac_middleware_1.authorize)({
    requireRole: roles_1.UserRole.PHARMACIST
});
const isDoctor = (0, rbac_middleware_1.authorize)({
    requireRole: roles_1.UserRole.DOCTOR
});
const isAdmin = (0, rbac_middleware_1.authorize)({
    requireRole: [roles_1.UserRole.ADMIN, roles_1.UserRole.SUPER_ADMIN]
});
// Medicine routes
// Allow doctors to view medicines for prescriptions
router.get('/medicines', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(medicine_controller_1.MedicineController.getAllMedicines));
router.get('/medicines/low-stock', auth_middleware_1.authenticate, isPharmacistOrAdmin, (0, error_middleware_1.errorHandler)(medicine_controller_1.MedicineController.getLowStockMedicines));
router.get('/medicines/expiring', auth_middleware_1.authenticate, isPharmacistOrAdmin, (0, error_middleware_1.errorHandler)(medicine_controller_1.MedicineController.getExpiringMedicines));
router.get('/medicines/:id', auth_middleware_1.authenticate, isPharmacistOrAdmin, (0, error_middleware_1.errorHandler)(medicine_controller_1.MedicineController.getMedicineById));
router.post('/medicines', auth_middleware_1.authenticate, isPharmacistOrAdmin, (0, error_middleware_1.errorHandler)(medicine_controller_1.MedicineController.createMedicine));
router.put('/medicines/:id', auth_middleware_1.authenticate, isPharmacistOrAdmin, (0, error_middleware_1.errorHandler)(medicine_controller_1.MedicineController.updateMedicine));
router.delete('/medicines/:id', auth_middleware_1.authenticate, isAdmin, (0, error_middleware_1.errorHandler)(medicine_controller_1.MedicineController.deleteMedicine));
// Prescription routes
router.post('/prescriptions', auth_middleware_1.authenticate, isDoctor, (0, error_middleware_1.errorHandler)(prescription_controller_1.PrescriptionController.createPrescription));
router.get('/prescriptions/patient/:patientId', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(prescription_controller_1.PrescriptionController.getPatientPrescriptions));
router.get('/prescriptions/doctor', auth_middleware_1.authenticate, isDoctor, (0, error_middleware_1.errorHandler)(prescription_controller_1.PrescriptionController.getDoctorPrescriptions));
router.get('/prescriptions/pending', auth_middleware_1.authenticate, isPharmacistOrAdmin, (0, error_middleware_1.errorHandler)(prescription_controller_1.PrescriptionController.getPendingPrescriptions));
router.get('/prescriptions/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(prescription_controller_1.PrescriptionController.getPrescriptionById));
router.put('/prescriptions/:id/dispense', auth_middleware_1.authenticate, isPharmacistOrAdmin, (0, error_middleware_1.errorHandler)(prescription_controller_1.PrescriptionController.dispensePrescription));
router.put('/prescriptions/:id/cancel', auth_middleware_1.authenticate, isDoctor, (0, error_middleware_1.errorHandler)(prescription_controller_1.PrescriptionController.cancelPrescription));
// Inventory routes
router.post('/inventory/add-stock', auth_middleware_1.authenticate, isPharmacistOrAdmin, (0, error_middleware_1.errorHandler)(inventory_controller_1.InventoryController.addStock));
router.post('/inventory/adjust-stock', auth_middleware_1.authenticate, isPharmacistOrAdmin, (0, error_middleware_1.errorHandler)(inventory_controller_1.InventoryController.adjustStock));
router.post('/inventory/damaged-stock', auth_middleware_1.authenticate, isPharmacistOrAdmin, (0, error_middleware_1.errorHandler)(inventory_controller_1.InventoryController.recordDamagedStock));
router.get('/inventory/transactions', auth_middleware_1.authenticate, isPharmacistOrAdmin, (0, error_middleware_1.errorHandler)(inventory_controller_1.InventoryController.getTransactionHistory));
router.get('/inventory/reports', auth_middleware_1.authenticate, isPharmacistOrAdmin, (0, error_middleware_1.errorHandler)(inventory_controller_1.InventoryController.generateInventoryReport));
exports.default = router;
