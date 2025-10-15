"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const referral_controller_1 = require("../controllers/referral.controller");
const router = (0, express_1.Router)();
// Admin-only for now
router.post('/referrals', auth_middleware_1.authenticate, rbac_middleware_1.isAdmin, (0, error_middleware_1.errorHandler)(referral_controller_1.ReferralController.createReferral));
router.get('/patients/:patientId/referrals', auth_middleware_1.authenticate, rbac_middleware_1.isAdmin, (0, error_middleware_1.errorHandler)(referral_controller_1.ReferralController.listPatientReferrals));
// Doctor: create referral for a patient they can access per FR-001
router.post('/patients/:patientId/referrals/doctor', auth_middleware_1.authenticate, rbac_middleware_1.isDoctor, (0, error_middleware_1.errorHandler)(referral_controller_1.ReferralController.doctorCreateReferral));
// Doctor: list referrals for a patient (FR-001/treated-patient enforced)
router.get('/patients/:patientId/referrals/doctor', auth_middleware_1.authenticate, rbac_middleware_1.isDoctor, (0, error_middleware_1.errorHandler)(referral_controller_1.ReferralController.doctorListReferrals));
exports.default = router;
