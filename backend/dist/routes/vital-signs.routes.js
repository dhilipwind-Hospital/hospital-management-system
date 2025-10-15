"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vital_signs_controller_1 = require("../controllers/vital-signs.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
// Record vital signs
router.post('/', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(vital_signs_controller_1.VitalSignsController.recordVitalSigns));
// Get vital signs
router.get('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(vital_signs_controller_1.VitalSignsController.getVitalSigns));
// Get patient vital signs
router.get('/patient/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(vital_signs_controller_1.VitalSignsController.getPatientVitalSigns));
// Get vital signs trends
router.get('/patient/:id/trends', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(vital_signs_controller_1.VitalSignsController.getVitalSignsTrends));
exports.default = router;
