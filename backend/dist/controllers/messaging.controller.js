"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingController = void 0;
const database_1 = require("../config/database");
const Message_1 = require("../models/Message");
const User_1 = require("../models/User");
class MessagingController {
}
exports.MessagingController = MessagingController;
_a = MessagingController;
// Send message
MessagingController.sendMessage = async (req, res) => {
    var _b;
    try {
        const senderId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { recipientId, content, subject, attachmentUrl } = req.body;
        if (!recipientId || !content) {
            return res.status(400).json({ message: 'Recipient and content are required' });
        }
        const messageRepo = database_1.AppDataSource.getRepository(Message_1.Message);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const sender = await userRepo.findOne({ where: { id: senderId } });
        const recipient = await userRepo.findOne({ where: { id: recipientId } });
        if (!sender || !recipient) {
            return res.status(404).json({ message: 'User not found' });
        }
        const message = messageRepo.create({
            sender,
            recipient,
            content,
            subject,
            attachmentUrl,
            status: Message_1.MessageStatus.SENT
        });
        await messageRepo.save(message);
        // TODO: Send notification to recipient
        // await NotificationService.sendMessageNotification(recipient, sender, message);
        return res.status(201).json({
            message: 'Message sent successfully',
            data: message
        });
    }
    catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ message: 'Error sending message' });
    }
};
// Get conversations
MessagingController.getConversations = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const messageRepo = database_1.AppDataSource.getRepository(Message_1.Message);
        // Get unique conversation partners
        const sentMessages = await messageRepo
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.recipient', 'recipient')
            .where('message.senderId = :userId', { userId })
            .select(['message.recipientId', 'recipient'])
            .distinct(true)
            .getMany();
        const receivedMessages = await messageRepo
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .where('message.recipientId = :userId', { userId })
            .select(['message.senderId', 'sender'])
            .distinct(true)
            .getMany();
        // Combine and get unique users
        const conversationPartners = new Map();
        sentMessages.forEach(msg => {
            if (msg.recipient) {
                conversationPartners.set(msg.recipient.id, msg.recipient);
            }
        });
        receivedMessages.forEach(msg => {
            if (msg.sender) {
                conversationPartners.set(msg.sender.id, msg.sender);
            }
        });
        const conversations = Array.from(conversationPartners.values());
        return res.json({
            data: conversations,
            total: conversations.length
        });
    }
    catch (error) {
        console.error('Error fetching conversations:', error);
        return res.status(500).json({ message: 'Error fetching conversations' });
    }
};
// Get messages with specific user
MessagingController.getMessages = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { otherUserId } = req.params;
        const { limit = 50 } = req.query;
        const messageRepo = database_1.AppDataSource.getRepository(Message_1.Message);
        const messages = await messageRepo
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.recipient', 'recipient')
            .where('(message.senderId = :userId AND message.recipientId = :otherUserId) OR (message.senderId = :otherUserId AND message.recipientId = :userId)', { userId, otherUserId })
            .orderBy('message.createdAt', 'DESC')
            .take(Number(limit))
            .getMany();
        return res.json({
            data: messages.reverse(),
            total: messages.length
        });
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ message: 'Error fetching messages' });
    }
};
// Mark message as read
MessagingController.markAsRead = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { id } = req.params;
        const messageRepo = database_1.AppDataSource.getRepository(Message_1.Message);
        const message = await messageRepo.findOne({
            where: { id },
            relations: ['recipient']
        });
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        if (message.recipient.id !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        message.isRead = true;
        message.readAt = new Date();
        message.status = Message_1.MessageStatus.READ;
        await messageRepo.save(message);
        return res.json({
            message: 'Message marked as read',
            data: message
        });
    }
    catch (error) {
        console.error('Error marking message as read:', error);
        return res.status(500).json({ message: 'Error marking message as read' });
    }
};
// Get unread count
MessagingController.getUnreadCount = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const messageRepo = database_1.AppDataSource.getRepository(Message_1.Message);
        const count = await messageRepo.count({
            where: {
                recipient: { id: userId },
                isRead: false
            }
        });
        return res.json({ count });
    }
    catch (error) {
        console.error('Error fetching unread count:', error);
        return res.status(500).json({ message: 'Error fetching unread count' });
    }
};
// Delete message
MessagingController.deleteMessage = async (req, res) => {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { id } = req.params;
        const messageRepo = database_1.AppDataSource.getRepository(Message_1.Message);
        const message = await messageRepo.findOne({
            where: { id },
            relations: ['sender', 'recipient']
        });
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        if (message.sender.id !== userId && message.recipient.id !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await messageRepo.remove(message);
        return res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting message:', error);
        return res.status(500).json({ message: 'Error deleting message' });
    }
};
