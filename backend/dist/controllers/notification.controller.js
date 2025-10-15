"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const database_1 = require("../config/database");
const Notification_1 = require("../models/Notification");
const User_1 = require("../models/User");
class NotificationController {
}
exports.NotificationController = NotificationController;
_a = NotificationController;
// Get user's notifications
NotificationController.getMyNotifications = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { unreadOnly, limit = 50, offset = 0 } = req.query;
        const repo = database_1.AppDataSource.getRepository(Notification_1.Notification);
        const queryBuilder = repo.createQueryBuilder('notification')
            .where('notification.userId = :userId', { userId })
            .orderBy('notification.createdAt', 'DESC')
            .skip(Number(offset))
            .take(Number(limit));
        if (unreadOnly === 'true') {
            queryBuilder.andWhere('notification.isRead = :isRead', { isRead: false });
        }
        const [notifications, total] = await queryBuilder.getManyAndCount();
        const unreadCount = await repo.count({
            where: { user: { id: userId }, isRead: false }
        });
        return res.json({
            data: notifications,
            total,
            unreadCount,
            limit: Number(limit),
            offset: Number(offset)
        });
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ message: 'Error fetching notifications' });
    }
};
// Mark notification as read
NotificationController.markAsRead = async (req, res) => {
    var _b;
    try {
        const { id } = req.params;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const repo = database_1.AppDataSource.getRepository(Notification_1.Notification);
        const notification = await repo.findOne({
            where: { id },
            relations: ['user']
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        if (notification.user.id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        notification.isRead = true;
        notification.readAt = new Date();
        await repo.save(notification);
        return res.json({
            message: 'Notification marked as read',
            data: notification
        });
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({ message: 'Error updating notification' });
    }
};
// Mark all as read
NotificationController.markAllAsRead = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const repo = database_1.AppDataSource.getRepository(Notification_1.Notification);
        await repo.createQueryBuilder()
            .update(Notification_1.Notification)
            .set({ isRead: true, readAt: new Date() })
            .where('userId = :userId AND isRead = :isRead', { userId, isRead: false })
            .execute();
        return res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('Error marking all as read:', error);
        return res.status(500).json({ message: 'Error updating notifications' });
    }
};
// Delete notification
NotificationController.deleteNotification = async (req, res) => {
    var _b;
    try {
        const { id } = req.params;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const repo = database_1.AppDataSource.getRepository(Notification_1.Notification);
        const notification = await repo.findOne({
            where: { id },
            relations: ['user']
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        if (notification.user.id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await repo.remove(notification);
        return res.json({ message: 'Notification deleted' });
    }
    catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({ message: 'Error deleting notification' });
    }
};
// Get unread count
NotificationController.getUnreadCount = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const repo = database_1.AppDataSource.getRepository(Notification_1.Notification);
        const count = await repo.count({
            where: { user: { id: userId }, isRead: false }
        });
        return res.json({ count });
    }
    catch (error) {
        console.error('Error getting unread count:', error);
        return res.status(500).json({ message: 'Error fetching count' });
    }
};
// Create notification (internal use by other controllers)
NotificationController.createNotification = async (userId, type, title, message, options) => {
    try {
        const repo = database_1.AppDataSource.getRepository(Notification_1.Notification);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            console.error('User not found for notification:', userId);
            return null;
        }
        const notification = repo.create({
            user,
            type,
            title,
            message,
            priority: (options === null || options === void 0 ? void 0 : options.priority) || Notification_1.NotificationPriority.MEDIUM,
            metadata: options === null || options === void 0 ? void 0 : options.metadata,
            actionUrl: options === null || options === void 0 ? void 0 : options.actionUrl,
            actionLabel: options === null || options === void 0 ? void 0 : options.actionLabel
        });
        await repo.save(notification);
        return notification;
    }
    catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};
// Broadcast notification to multiple users
NotificationController.broadcastNotification = async (userIds, type, title, message, options) => {
    try {
        const repo = database_1.AppDataSource.getRepository(Notification_1.Notification);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const users = await userRepo.findByIds(userIds);
        const notifications = users.map(user => repo.create({
            user,
            type,
            title,
            message,
            priority: (options === null || options === void 0 ? void 0 : options.priority) || Notification_1.NotificationPriority.MEDIUM,
            metadata: options === null || options === void 0 ? void 0 : options.metadata,
            actionUrl: options === null || options === void 0 ? void 0 : options.actionUrl,
            actionLabel: options === null || options === void 0 ? void 0 : options.actionLabel
        }));
        await repo.save(notifications);
        return notifications;
    }
    catch (error) {
        console.error('Error broadcasting notifications:', error);
        return [];
    }
};
// Admin: Send system announcement
NotificationController.sendAnnouncement = async (req, res) => {
    try {
        const { title, message, targetRoles, priority } = req.body;
        if (!title || !message) {
            return res.status(400).json({ message: 'Title and message are required' });
        }
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        let users;
        if (targetRoles && targetRoles.length > 0) {
            users = await userRepo.createQueryBuilder('user')
                .where('user.role IN (:...roles)', { roles: targetRoles })
                .andWhere('user.isActive = :isActive', { isActive: true })
                .getMany();
        }
        else {
            users = await userRepo.find({ where: { isActive: true } });
        }
        const userIds = users.map(u => u.id);
        await NotificationController.broadcastNotification(userIds, Notification_1.NotificationType.SYSTEM_ANNOUNCEMENT, title, message, { priority: priority || Notification_1.NotificationPriority.MEDIUM });
        return res.json({
            message: 'Announcement sent successfully',
            recipientCount: userIds.length
        });
    }
    catch (error) {
        console.error('Error sending announcement:', error);
        return res.status(500).json({ message: 'Error sending announcement' });
    }
};
