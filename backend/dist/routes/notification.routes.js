"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 */
router.get('/', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(notification_controller_1.NotificationController.getMyNotifications));
/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/unread-count', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(notification_controller_1.NotificationController.getUnreadCount));
/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/read', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(notification_controller_1.NotificationController.markAsRead));
/**
 * @swagger
 * /notifications/mark-all-read:
 *   post:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/mark-all-read', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(notification_controller_1.NotificationController.markAllAsRead));
/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, error_middleware_1.errorHandler)(notification_controller_1.NotificationController.deleteNotification));
/**
 * @swagger
 * /notifications/announcement:
 *   post:
 *     summary: Send system announcement (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/announcement', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'super_admin']), (0, error_middleware_1.errorHandler)(notification_controller_1.NotificationController.sendAnnouncement));
exports.default = router;
