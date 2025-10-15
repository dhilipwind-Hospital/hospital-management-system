"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const roles_1 = require("../types/roles");
const Notification_1 = require("../models/Notification");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
async function sendTestNotification() {
    try {
        // Initialize database connection
        await database_1.AppDataSource.initialize();
        console.log('✅ Connected to PostgreSQL');
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const notificationRepo = database_1.AppDataSource.getRepository(Notification_1.Notification);
        // Find user by email
        let user = await userRepo.findOne({
            where: { email: 'dhilipwind@gmail.com' }
        });
        if (!user) {
            console.log('❌ User not found with email: dhilipwind@gmail.com');
            console.log('📝 Creating test user...');
            // Create test user if not exists
            const hashedPassword = await bcryptjs_1.default.hash('Test@123', 10);
            const newUser = userRepo.create({
                email: 'dhilipwind@gmail.com',
                password: hashedPassword,
                firstName: 'Dhilip',
                lastName: 'Elango',
                phone: '1234567890',
                role: roles_1.UserRole.PATIENT
            });
            user = await userRepo.save(newUser);
            console.log('✅ Test user created successfully');
            // Create notification for new user
            const notification = notificationRepo.create({
                user: user,
                type: Notification_1.NotificationType.SYSTEM_ANNOUNCEMENT,
                title: '🎉 Welcome to Hospital Management System!',
                message: `Hello Dhilip! Your account has been created successfully. You can now access all features of the hospital management system.`,
                priority: Notification_1.NotificationPriority.HIGH,
                actionUrl: '/portal',
                actionLabel: 'Go to Dashboard',
                isRead: false
            });
            await notificationRepo.save(notification);
            console.log('✅ Welcome notification sent successfully!');
        }
        else {
            console.log('✅ User found:', user.firstName, user.lastName);
            // Create test notification
            const notification = notificationRepo.create({
                user: user,
                type: Notification_1.NotificationType.SYSTEM_ANNOUNCEMENT,
                title: '🔔 Test Notification from Hospital System',
                message: `Hi ${user.firstName}! This is a test notification sent at ${new Date().toLocaleString()}. Your notification system is working perfectly! ✅`,
                priority: Notification_1.NotificationPriority.HIGH,
                actionUrl: '/notifications',
                actionLabel: 'View All Notifications',
                isRead: false
            });
            await notificationRepo.save(notification);
            console.log('✅ Test notification sent successfully!');
        }
        // Get all notifications for this user
        const allNotifications = await notificationRepo.find({
            where: { user: { email: 'dhilipwind@gmail.com' } },
            order: { createdAt: 'DESC' },
            take: 5
        });
        console.log('\n📊 Recent Notifications:');
        console.log('========================');
        allNotifications.forEach((notif, index) => {
            console.log(`${index + 1}. ${notif.title}`);
            console.log(`   ${notif.message}`);
            console.log(`   Status: ${notif.isRead ? '✅ Read' : '📬 Unread'}`);
            console.log(`   Created: ${notif.createdAt}`);
            console.log('---');
        });
        console.log('\n✅ Notification system is working fine!');
        console.log('📧 Email: dhilipwind@gmail.com');
        console.log('🔔 Total notifications:', allNotifications.length);
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
sendTestNotification();
