"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const diagnosis_controller_1 = require("../controllers/diagnosis.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
// Add diagnosis
router.post('/', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(diagnosis_controller_1.DiagnosisController.addDiagnosis));
// Get diagnosis
router.get('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(diagnosis_controller_1.DiagnosisController.getDiagnosis));
// Update diagnosis
router.put('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(diagnosis_controller_1.DiagnosisController.updateDiagnosis));
// Get patient diagnoses
router.get('/patient/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(diagnosis_controller_1.DiagnosisController.getPatientDiagnoses));
// Search ICD-10 codes
router.get('/icd10/search', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(diagnosis_controller_1.DiagnosisController.searchICD10));
// Get common diagnoses
router.get('/common/list', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(diagnosis_controller_1.DiagnosisController.getCommonDiagnoses));
exports.default = router;
