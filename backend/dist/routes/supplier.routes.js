"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supplier_controller_1 = require("../controllers/supplier.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
// Get all suppliers
router.get('/', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(supplier_controller_1.SupplierController.getSuppliers));
// Get supplier by ID
router.get('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(supplier_controller_1.SupplierController.getSupplier));
// Create supplier
router.post('/', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(supplier_controller_1.SupplierController.createSupplier));
// Update supplier
router.put('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(supplier_controller_1.SupplierController.updateSupplier));
// Delete supplier
router.delete('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(supplier_controller_1.SupplierController.deleteSupplier));
// Get supplier orders
router.get('/:id/orders', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(supplier_controller_1.SupplierController.getSupplierOrders));
exports.default = router;
