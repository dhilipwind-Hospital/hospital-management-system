"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const purchase_order_controller_1 = require("../controllers/purchase-order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
// Get all purchase orders
router.get('/', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(purchase_order_controller_1.PurchaseOrderController.getPurchaseOrders));
// Get purchase order by ID
router.get('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(purchase_order_controller_1.PurchaseOrderController.getPurchaseOrder));
// Create purchase order
router.post('/', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(purchase_order_controller_1.PurchaseOrderController.createPurchaseOrder));
// Update order status
router.put('/:id/status', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(purchase_order_controller_1.PurchaseOrderController.updateOrderStatus));
// Receive purchase order
router.post('/:id/receive', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(purchase_order_controller_1.PurchaseOrderController.receivePurchaseOrder));
// Auto-generate purchase orders
router.post('/auto-generate', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(purchase_order_controller_1.PurchaseOrderController.generateAutoOrders));
exports.default = router;
