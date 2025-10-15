"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medicalRecords_controller_1 = require("../controllers/medicalRecords.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get all medical records (with filters)
router.get('/', medicalRecords_controller_1.getMedicalRecords);
// Get aggregated records (medical records + prescriptions + lab results)
router.get('/aggregated', medicalRecords_controller_1.getAggregatedRecords);
// Get single medical record
router.get('/:id', medicalRecords_controller_1.getMedicalRecord);
// Create medical record (with optional file upload)
router.post('/', medicalRecords_controller_1.upload.single('file'), medicalRecords_controller_1.createMedicalRecord);
// Update medical record (with optional file upload)
router.put('/:id', medicalRecords_controller_1.upload.single('file'), medicalRecords_controller_1.updateMedicalRecord);
// Delete medical record
router.delete('/:id', medicalRecords_controller_1.deleteMedicalRecord);
// Download medical record file
router.get('/:id/download', medicalRecords_controller_1.downloadMedicalRecord);
exports.default = router;
