"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lab_test_controller_1 = require("../controllers/lab-test.controller");
const lab_order_controller_1 = require("../controllers/lab-order.controller");
const lab_sample_controller_1 = require("../controllers/lab-sample.controller");
const lab_result_controller_1 = require("../controllers/lab-result.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// ==================== LAB TEST ROUTES ====================
// Get test categories (must be before /tests/:id)
router.get('/tests/categories', auth_middleware_1.authenticate, lab_test_controller_1.LabTestController.getCategories);
// Get all lab tests (accessible to doctors and lab techs)
router.get('/tests', auth_middleware_1.authenticate, lab_test_controller_1.LabTestController.getAllLabTests);
// Get single lab test
router.get('/tests/:id', auth_middleware_1.authenticate, lab_test_controller_1.LabTestController.getLabTestById);
// Create lab test (admin only)
router.post('/tests', auth_middleware_1.authenticate, lab_test_controller_1.LabTestController.createLabTest);
// Update lab test (admin only)
router.put('/tests/:id', auth_middleware_1.authenticate, lab_test_controller_1.LabTestController.updateLabTest);
// Delete lab test (admin only)
router.delete('/tests/:id', auth_middleware_1.authenticate, lab_test_controller_1.LabTestController.deleteLabTest);
// ==================== LAB ORDER ROUTES ====================
// Create lab order (doctors only)
router.post('/orders', auth_middleware_1.authenticate, lab_order_controller_1.LabOrderController.createLabOrder);
// Get all lab orders (admin/lab tech)
router.get('/orders', auth_middleware_1.authenticate, lab_order_controller_1.LabOrderController.getAllLabOrders);
// Get pending lab orders (lab tech)
router.get('/orders/pending', auth_middleware_1.authenticate, lab_order_controller_1.LabOrderController.getPendingLabOrders);
// Get doctor's lab orders
router.get('/orders/doctor', auth_middleware_1.authenticate, lab_order_controller_1.LabOrderController.getDoctorLabOrders);
// Get patient's lab orders
router.get('/orders/patient/:patientId', auth_middleware_1.authenticate, lab_order_controller_1.LabOrderController.getPatientLabOrders);
// Get single lab order
router.get('/orders/:id', auth_middleware_1.authenticate, lab_order_controller_1.LabOrderController.getLabOrderById);
// Update lab order status
router.put('/orders/:id/status', auth_middleware_1.authenticate, lab_order_controller_1.LabOrderController.updateLabOrderStatus);
// Cancel lab order
router.put('/orders/:id/cancel', auth_middleware_1.authenticate, lab_order_controller_1.LabOrderController.cancelLabOrder);
// ==================== LAB SAMPLE ROUTES ====================
// Register sample (lab tech)
router.post('/samples', auth_middleware_1.authenticate, lab_sample_controller_1.LabSampleController.registerSample);
// Update sample status (lab tech)
router.put('/samples/:id/status', auth_middleware_1.authenticate, lab_sample_controller_1.LabSampleController.updateSampleStatus);
// Reject sample (lab tech)
router.put('/samples/:id/reject', auth_middleware_1.authenticate, lab_sample_controller_1.LabSampleController.rejectSample);
// Get sample by ID
router.get('/samples/:id', auth_middleware_1.authenticate, lab_sample_controller_1.LabSampleController.getSampleById);
// Get samples by lab order
router.get('/orders/:orderId/samples', auth_middleware_1.authenticate, lab_sample_controller_1.LabSampleController.getSamplesByLabOrder);
// ==================== LAB RESULT ROUTES ====================
// Enter lab result (lab tech)
router.post('/results', auth_middleware_1.authenticate, lab_result_controller_1.LabResultController.enterLabResult);
// Verify lab result (lab supervisor)
router.put('/results/:id/verify', auth_middleware_1.authenticate, lab_result_controller_1.LabResultController.verifyLabResult);
// Get result by ID
router.get('/results/:id', auth_middleware_1.authenticate, lab_result_controller_1.LabResultController.getResultById);
// Get results by lab order
router.get('/orders/:orderId/results', auth_middleware_1.authenticate, lab_result_controller_1.LabResultController.getResultsByLabOrder);
// Get patient lab results
router.get('/results/patient/:patientId', auth_middleware_1.authenticate, lab_result_controller_1.LabResultController.getPatientLabResults);
exports.default = router;
