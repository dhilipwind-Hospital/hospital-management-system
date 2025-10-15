"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const callback_controller_1 = require("../controllers/callback.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /callback/queue:
 *   get:
 *     summary: Get callback requests queue
 *     tags: [Callback]
 *     security:
 *       - bearerAuth: []
 */
router.get('/queue', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin', 'receptionist', 'nurse']), (0, error_middleware_1.errorHandler)(callback_controller_1.CallbackController.getQueue));
/**
 * @swagger
 * /callback/statistics:
 *   get:
 *     summary: Get callback statistics
 *     tags: [Callback]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin', 'receptionist', 'nurse']), (0, error_middleware_1.errorHandler)(callback_controller_1.CallbackController.getStatistics));
/**
 * @swagger
 * /callback/{id}:
 *   get:
 *     summary: Get single callback request
 *     tags: [Callback]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin', 'receptionist', 'nurse']), (0, error_middleware_1.errorHandler)(callback_controller_1.CallbackController.getRequest));
/**
 * @swagger
 * /callback/{id}/assign:
 *   patch:
 *     summary: Assign callback request to staff
 *     tags: [Callback]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/assign', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin', 'receptionist', 'nurse']), (0, error_middleware_1.errorHandler)(callback_controller_1.CallbackController.assignRequest));
/**
 * @swagger
 * /callback/{id}/status:
 *   patch:
 *     summary: Update callback request status
 *     tags: [Callback]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin', 'receptionist', 'nurse']), (0, error_middleware_1.errorHandler)(callback_controller_1.CallbackController.updateStatus));
/**
 * @swagger
 * /callback/{id}/notes:
 *   post:
 *     summary: Add notes to callback request
 *     tags: [Callback]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/notes', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin', 'receptionist', 'nurse']), (0, error_middleware_1.errorHandler)(callback_controller_1.CallbackController.addNotes));
/**
 * @swagger
 * /callback/{id}:
 *   delete:
 *     summary: Delete callback request
 *     tags: [Callback]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin']), (0, error_middleware_1.errorHandler)(callback_controller_1.CallbackController.deleteRequest));
exports.default = router;
