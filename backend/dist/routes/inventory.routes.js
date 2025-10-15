"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
// Generate alerts
router.post('/alerts/generate', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inventory_controller_1.InventoryController.generateAlerts));
// Get alerts
router.get('/alerts', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inventory_controller_1.InventoryController.getAlerts));
// Acknowledge alert
router.put('/alerts/:id/acknowledge', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inventory_controller_1.InventoryController.acknowledgeAlert));
// Get stock movements
router.get('/movements', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inventory_controller_1.InventoryController.getStockMovements));
// Record stock movement
router.post('/movements', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inventory_controller_1.InventoryController.recordMovement));
// Get dashboard
router.get('/dashboard', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inventory_controller_1.InventoryController.getDashboard));
// Get expiry report
router.get('/expiry-report', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inventory_controller_1.InventoryController.getExpiryReport));
// Get reorder report
router.get('/reorder-report', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(inventory_controller_1.InventoryController.getReorderReport));
exports.default = router;
