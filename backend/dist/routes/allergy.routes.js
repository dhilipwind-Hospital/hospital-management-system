"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const allergy_controller_1 = require("../controllers/allergy.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
// Add allergy
router.post('/', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(allergy_controller_1.AllergyController.addAllergy));
// Get allergy
router.get('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(allergy_controller_1.AllergyController.getAllergy));
// Update allergy
router.put('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(allergy_controller_1.AllergyController.updateAllergy));
// Get patient allergies
router.get('/patient/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(allergy_controller_1.AllergyController.getPatientAllergies));
// Verify allergy
router.post('/:id/verify', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(allergy_controller_1.AllergyController.verifyAllergy));
// Check drug allergies
router.post('/check-drug', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(allergy_controller_1.AllergyController.checkDrugAllergies));
exports.default = router;
