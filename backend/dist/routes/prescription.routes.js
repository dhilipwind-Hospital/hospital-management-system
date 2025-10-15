"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prescription_controller_1 = require("../controllers/prescription.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Create a new prescription (doctors only)
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.checkRole)(['doctor']), prescription_controller_1.createPrescription);
// Get prescriptions by doctor
router.get('/doctor/:doctorId', auth_middleware_1.authenticate, (0, role_middleware_1.checkRole)(['doctor', 'admin']), prescription_controller_1.getPrescriptionsByDoctor);
// Get prescriptions by patient
router.get('/patient/:patientId', auth_middleware_1.authenticate, prescription_controller_1.getPrescriptionsByPatient);
// Get prescriptions for pharmacy
router.get('/pharmacy', auth_middleware_1.authenticate, (0, role_middleware_1.checkRole)(['pharmacist', 'admin']), prescription_controller_1.getPharmacyPrescriptions);
// Get a single prescription by ID
router.get('/:id', auth_middleware_1.authenticate, prescription_controller_1.getPrescriptionById);
// Update prescription status (for pharmacy dispensing)
router.put('/:id/status', auth_middleware_1.authenticate, (0, role_middleware_1.checkRole)(['pharmacist', 'admin']), prescription_controller_1.updatePrescriptionStatus);
// Update prescription (for doctors to edit pending prescriptions)
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.checkRole)(['doctor', 'admin']), prescription_controller_1.updatePrescription);
// Cancel a prescription
router.put('/:id/cancel', auth_middleware_1.authenticate, (0, role_middleware_1.checkRole)(['doctor', 'admin']), prescription_controller_1.cancelPrescription);
exports.default = router;
