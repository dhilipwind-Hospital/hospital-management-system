"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emergency_controller_1 = require("../controllers/emergency.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /emergency/dashboard:
 *   get:
 *     summary: Get emergency requests dashboard (admin/staff only)
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, in_progress, resolved, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [all, critical, high, medium, low]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Emergency requests list
 */
router.get('/dashboard', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin', 'doctor', 'nurse']), (0, error_middleware_1.errorHandler)(emergency_controller_1.EmergencyController.getDashboard));
/**
 * @swagger
 * /emergency/statistics:
 *   get:
 *     summary: Get emergency statistics
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin', 'doctor', 'nurse']), (0, error_middleware_1.errorHandler)(emergency_controller_1.EmergencyController.getStatistics));
/**
 * @swagger
 * /emergency/{id}:
 *   get:
 *     summary: Get single emergency request
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin', 'doctor', 'nurse']), (0, error_middleware_1.errorHandler)(emergency_controller_1.EmergencyController.getRequest));
/**
 * @swagger
 * /emergency/{id}/assign:
 *   patch:
 *     summary: Assign emergency request to staff
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/assign', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin', 'doctor', 'nurse']), (0, error_middleware_1.errorHandler)(emergency_controller_1.EmergencyController.assignRequest));
/**
 * @swagger
 * /emergency/{id}/status:
 *   patch:
 *     summary: Update emergency request status
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin', 'doctor', 'nurse']), (0, error_middleware_1.errorHandler)(emergency_controller_1.EmergencyController.updateStatus));
/**
 * @swagger
 * /emergency/{id}/priority:
 *   patch:
 *     summary: Update emergency request priority
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/priority', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin', 'doctor', 'nurse']), (0, error_middleware_1.errorHandler)(emergency_controller_1.EmergencyController.updatePriority));
/**
 * @swagger
 * /emergency/{id}/notes:
 *   post:
 *     summary: Add notes to emergency request
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/notes', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin', 'doctor', 'nurse']), (0, error_middleware_1.errorHandler)(emergency_controller_1.EmergencyController.addNotes));
/**
 * @swagger
 * /emergency/{id}:
 *   delete:
 *     summary: Delete emergency request
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin']), (0, error_middleware_1.errorHandler)(emergency_controller_1.EmergencyController.deleteRequest));
exports.default = router;
