"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const insurance_controller_1 = require("../controllers/insurance.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public endpoints
router.get('/plans', insurance_controller_1.InsuranceController.listPlans);
router.post('/plans/recommend', insurance_controller_1.InsuranceController.recommendPlans);
router.post('/plans/compare', insurance_controller_1.InsuranceController.comparePlans);
router.post('/calculator/premium', insurance_controller_1.InsuranceController.calculatePremium);
router.post('/plans/family-calc', insurance_controller_1.InsuranceController.familyCalc);
// Patient endpoints (auth required)
router.post('/plans/purchase', auth_middleware_1.authenticate, insurance_controller_1.InsuranceController.purchase);
router.get('/users/me/claims', auth_middleware_1.authenticate, insurance_controller_1.InsuranceController.listMyClaims);
router.get('/users/me/dashboard', auth_middleware_1.authenticate, insurance_controller_1.InsuranceController.myDashboard);
exports.default = router;
